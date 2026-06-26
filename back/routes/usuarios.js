const express = require('express');
const router = express.Router();

const { getUsers } = require('../controllers/usuarios');
const { connection } = require('../config/database');


const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');



// Rutas para usuarios
router.get('/usuarios',authMiddleware, (req, res) => {
    const query = 'SELECT id_usuario, email, nombre FROM usuarios'
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});


// POST /usuarios - Crear nuevo usuario
router.post('/usuarios', authMiddleware, (req, res) => {
    const { nombre, email, contraseña } = req.body

    const query = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';
    connection.query(query, [nombre, email, contraseña], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Error al crear el usuario' });
        }

        res.json({ message: 'Usuario creado', nombre, email });
    })
});


// GET /usuarios/:id - Obtener usuario por ID
router.get('/usuarios/:id', authMiddleware, (req, res) => {
    const userId = req.params.id
    const query = 'SELECT id_usuario, email, nombre FROM usuarios WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Error al obtener el usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
});


// POST /login - Autenticación
router.post('/login', (req, res) => {
    const { email, contraseña } = req.body

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al iniciar sesión' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];
        
        if (user.contraseña !== contraseña) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'secreto', 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            message: 'Inicio de sesion exitoso', 
            token, 
            usuario: { id: user.id, nombre: user.nombre, email: user.email } 
        });
    });
});

// POST /register - Registrar nuevo usuario
router.post('/register', (req, res) => {
    const { nombre, email, contraseña } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de servidor' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Se produjo un error durante el registro. Vuelve a intentarlo.' });
        }

        const insertQuery = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';
        connection.query(insertQuery, [nombre, email, contraseña], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al crear usuario' });
            }

            res.json({ 
                message: 'Usuario registrado exitosamente', 
                usuario: { id: result.insertId, nombre, email }
            });
        });
    });
});

module.exports = router;

