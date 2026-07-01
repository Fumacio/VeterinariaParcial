const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
    createVenta,
    getVentas,
    getVentaById
} = require('../controllers/ventas');

router.post('/ventas', createVenta);
router.get('/ventas', authMiddleware, adminMiddleware, getVentas);
router.get('/ventas/:id', authMiddleware, adminMiddleware, getVentaById);

module.exports = router;
