const express = require('express');
const router = express.Router();

const { connection } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Rutas para usuarios
router.get('/usuarios', authMiddleware, (req, res) => {
    const query = 'SELECT id_usuario, email, nombre, rol FROM usuarios';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }

        res.json(results);
    });
});

// POST /usuarios - Crear nuevo usuario
router.post('/usuarios', authMiddleware, async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    if (!nombre || !email || !contraseña) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        const passwordHash = await bcrypt.hash(contraseña, 10);
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
});

// GET /usuarios/:id - Obtener usuario por ID
router.get('/usuarios/:id', authMiddleware, (req, res) => {
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
});

// POST /login - Autenticacion
router.post('/login', (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
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
            const passwordValida = await bcrypt.compare(contraseña, user.contraseña);

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
});

// POST /register - Registrar nuevo usuario
router.post('/register', (req, res) => {
    const { nombre, email, contraseña } = req.body;

    if (!nombre || !email || !contraseña) {
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
            const passwordHash = await bcrypt.hash(contraseña, 10);
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
});

module.exports = router;
