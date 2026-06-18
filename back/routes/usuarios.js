const express = require('express');
const router = express.Router();

const { getUsers } = require('../controllers/usuarios');
const { connection } = require('../config/database');

const jwt = require('jsonwebtoken');




router.get('/usuarios', (req, res) => {
    const query = 'SELECT id, email, nombre FROM usuarios';
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});


router.post('/usuarios', (req, res) => {
    const { nombre, email, contraseña } = req.body;

    const query = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';
    connection.query(query, [nombre, email, contraseña], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al crear el usuario' });
        }

        res.json({ message: 'Usuario creado', nombre, email });
    })
});

router.get('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT id, email, nombre FROM usuarios WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
});


router.post('/login', (req, res) => {
    const { email, contraseña } = req.body;  // ✅ Recibe email Y contraseña

    if (!email || !contraseña) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al iniciar sesión' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = results[0];
        
        // ✅ Validar contraseña
        if (user.contraseña !== contraseña) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // ✅ Usar variable de entorno
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'secreto', 
            { expiresIn: '24h' }
        );
        
        res.json({ message: 'Inicio de sesión exitoso', token, usuario: { id: user.id, nombre: user.nombre, email: user.email } });
    });
});

module.exports = router;

