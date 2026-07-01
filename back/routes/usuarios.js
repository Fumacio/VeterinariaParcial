const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const {
    getUsuarios,
    createUsuario,
    getUsuarioById,
    login,
    register
} = require('../controllers/usuarios');

router.get('/usuarios', authMiddleware, getUsuarios);
router.post('/usuarios', authMiddleware, createUsuario);
router.get('/usuarios/:id', authMiddleware, getUsuarioById);
router.post('/login', login);
router.post('/register', register);

module.exports = router;
