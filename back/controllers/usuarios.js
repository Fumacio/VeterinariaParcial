const { connection } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const getUsuarios = (req, res) => {
    const query = 'SELECT id_usuario, email, nombre, rol FROM usuarios';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }

        res.json(results);
    });
};

const createUsuario = async (req, res) => {
    const { nombre, email } = req.body;
    const contrasena = req.body['contraseña'];

    if (!nombre || !email || !contrasena) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        const passwordHash = await bcrypt.hash(contrasena, 10);
        const query = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';

        connection.query(query, [nombre, email, passwordHash], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al crear el usuario' });
            }

            res.json({ message: 'Usuario creado', nombre, email });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

const getUsuarioById = (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT id_usuario, email, nombre, rol FROM usuarios WHERE id_usuario = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener el usuario' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(results[0]);
    });
};

const login = (req, res) => {
    const { email } = req.body;
    const contrasena = req.body['contraseña'];

    if (!email || !contrasena) {
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';

    connection.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al iniciar sesion' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];

        try {
            const passwordValida = await bcrypt.compare(contrasena, user.contraseña);

            if (!passwordValida) {
                return res.status(401).json({ error: 'Credenciales invalidas' });
            }

            const token = jwt.sign(
                { id: user.id_usuario, email: user.email, rol: user.rol },
                process.env.JWT_SECRET || 'secreto',
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Inicio de sesion exitoso',
                token,
                usuario: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al iniciar sesion' });
        }
    });
};

const register = (req, res) => {
    const { nombre, email } = req.body;
    const contrasena = req.body['contraseña'];

    if (!nombre || !email || !contrasena) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';

    connection.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de servidor' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Se produjo un error durante el registro. Vuelve a intentarlo.' });
        }

        try {
            const passwordHash = await bcrypt.hash(contrasena, 10);
            const insertQuery = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';

            connection.query(insertQuery, [nombre, email, passwordHash], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error al crear usuario' });
                }

                res.json({
                    message: 'Usuario registrado exitosamente',
                    usuario: { id: result.insertId, nombre, email }
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear usuario' });
        }
    });
};

module.exports = {
    getUsuarios,
    createUsuario,
    getUsuarioById,
    login,
    register
};
