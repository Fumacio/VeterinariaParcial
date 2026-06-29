const express = require('express');
const router = express.Router();

const { connection } = require('../config/database');

const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

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
        productos.id_categoria,
        productos.id_marca,
        productos.id_tipo,
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

router.get('/productos/:id', (req, res) => {
    const productoId = req.params.id;

    const query = `
        SELECT 
            productos.id_producto,
            productos.nombre,
            productos.descripcion,
            productos.precio,
            productos.stock,
            productos.imagen,
            productos.fecha_vencimiento,
            productos.id_categoria,
            productos.id_marca,
            productos.id_tipo,
            categorias.nombre AS categoria,
            marcas.nombre AS marca,
            tipos_mascota.nombre AS tipo_mascota
        FROM productos
        JOIN categorias ON productos.id_categoria = categorias.id_categoria
        JOIN marcas ON productos.id_marca = marcas.id_marca
        JOIN tipos_mascota ON productos.id_tipo = tipos_mascota.id_tipo
        WHERE productos.id_producto = ?
    `;

    connection.query(query, [productoId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener producto' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(results[0]);
    });
});

router.post('/productos', authMiddleware, adminMiddleware, (req, res) => {
    const {
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        fecha_vencimiento,
        id_categoria,
        id_marca,
        id_tipo
    } = req.body;

    if (!nombre || !precio || stock === undefined || !id_categoria || !id_marca || !id_tipo) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const query = `
        INSERT INTO productos
        (nombre, descripcion, precio, stock, imagen, fecha_vencimiento, id_categoria, id_marca, id_tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        query,
        [nombre, descripcion, precio, stock, imagen, fecha_vencimiento, id_categoria, id_marca, id_tipo],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al crear producto' });
            }

            res.status(201).json({
                message: 'Producto creado exitosamente',
                producto: {
                    id_producto: result.insertId,
                    nombre,
                    descripcion,
                    precio,
                    stock,
                    imagen,
                    fecha_vencimiento,
                    id_categoria,
                    id_marca,
                    id_tipo
                }
            });
        }
    );
});

router.put('/productos/:id', authMiddleware, adminMiddleware, (req, res) => {
    const productoId = req.params.id;

    const {
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        fecha_vencimiento,
        id_categoria,
        id_marca,
        id_tipo
    } = req.body;

    if (!nombre || !precio || stock === undefined || !id_categoria || !id_marca || !id_tipo) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const query = `
        UPDATE productos
        SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, fecha_vencimiento = ?, id_categoria = ?, id_marca = ?, id_tipo = ?
        WHERE id_producto = ?
    `;

    connection.query(
        query,
        [nombre, descripcion, precio, stock, imagen, fecha_vencimiento, id_categoria, id_marca, id_tipo, productoId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al actualizar producto' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            res.json({ message: 'Producto actualizado exitosamente' });
        }
    );
});

router.delete('/productos/:id', authMiddleware, adminMiddleware, (req, res) => {
    const productoId = req.params.id;

    const query = 'DELETE FROM productos WHERE id_producto = ?';

    connection.query(query, [productoId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al eliminar producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado exitosamente' });
    });
});

module.exports = router;
