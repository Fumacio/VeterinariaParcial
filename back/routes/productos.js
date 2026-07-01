const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} = require('../controllers/productos');

router.get('/productos', getProductos);
router.get('/productos/:id', getProductoById);
router.post('/productos', authMiddleware, adminMiddleware, createProducto);
router.put('/productos/:id', authMiddleware, adminMiddleware, updateProducto);
router.delete('/productos/:id', authMiddleware, adminMiddleware, deleteProducto);

module.exports = router;
