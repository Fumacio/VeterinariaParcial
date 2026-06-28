const express = require('express');
const router = express.Router();

const { connection } = require('../config/database');

const authMiddleware = require('../middleware/auth');

// Rutas para productos
router.get('/productos', (req, res) => {
    const query = `
    SELECT 
        productos.id_producto,
        productos.nombre,
        productos.descripcion,
        productos.precio,
        productos.stock,
        productos.imagen,
        productos.fecha_vencimiento,
        categorias.nombre AS categoria,
        marcas.nombre AS marca,
        tipos_mascota.nombre AS tipo_mascota

        FROM productos
        
        JOIN categorias ON productos.id_categoria = categorias.id_categoria
        JOIN marcas ON productos.id_marca = marcas.id_marca
        JOIN tipos_mascota ON productos.id_tipo = tipos_mascota.id_tipo`;
        connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        res.json(results);
    });
});

module.exports = router;
