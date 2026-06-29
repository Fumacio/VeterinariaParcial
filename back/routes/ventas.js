const express = require('express');
const router = express.Router();

const { connection } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.post('/ventas', (req, res) => {
    const { productos } = req.body


    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: `el carrito esta vacio` })

    }

    let total = 0
    productos.forEach(producto => {
        total += producto.precio * producto.cantidad
    });

    
    const ids = productos.map(producto => producto.id_producto);
    const stockQuery = 'SELECT id_producto, nombre, stock FROM productos WHERE id_producto IN (?)';

    connection.query(stockQuery, [ids], (err, productosDB) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al ver stock' });
        }

        for (const producto of productos) {
            const productoDB = productosDB.find(p => p.id_producto === producto.id_producto);

            if (!productoDB) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            if (producto.cantidad > productoDB.stock) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${productoDB.nombre}`
                });
            }
        }
            const ventaQuery = 'insert into ventas (total) values (?)'

            connection.query(ventaQuery, [total], (err, ventaResult) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error al crear la venta' });
                }

                const idVenta = ventaResult.insertId;

                const detalleValores = productos.map(producto => [
                    idVenta,
                    producto.id_producto,
                    producto.cantidad,
                    producto.precio,
                    producto.precio * producto.cantidad
                ]);

                const detalleQuery = `
            INSERT INTO detalle_venta
            (id_venta, id_producto, cantidad, precio_unitario, subtotal)
            VALUES ?`;

                connection.query(detalleQuery, [detalleValores], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Error al crear el detalle de venta' });
                    }

                    const actualizarStockQuery = `
                    UPDATE productos 
                    SET stock = stock - ?
                    WHERE id_producto = ?`;

                    let actualizacionesPendientes = productos.length;
                    let huboError = false;

                    productos.forEach(producto => {
                        connection.query(
                            actualizarStockQuery,
                            [producto.cantidad, producto.id_producto],
                            (err) => {
                                if (err && !huboError) {
                                    huboError = true;
                                    console.error(err);
                                    return res.status(500).json({ error: 'Error al actualizar stock' });
                                }

                                actualizacionesPendientes--;

                                if (actualizacionesPendientes === 0 && !huboError) {
                                    res.status(201).json({
                                        message: 'Venta registrada exitosamente',
                                        id_venta: idVenta,
                                        total
                                    });
                                }
                            }
                        );
                    });
                });
            });
        });
    });

// ver cada venta
router.get('/ventas', authMiddleware, adminMiddleware, (req, res) => {
    const query = 'SELECT id_venta, fecha, total FROM ventas ORDER BY fecha DESC';

    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener ventas' });
        }

        res.json(results);
    });
});

// detalle de cada venta
router.get('/ventas/:id', authMiddleware, adminMiddleware, (req, res) => {
    const ventaId = req.params.id;

    const query = `
        SELECT 
            ventas.id_venta,
            ventas.fecha,
            ventas.total,
            detalle_venta.id_detalle,
            detalle_venta.id_producto,
            productos.nombre AS producto,
            detalle_venta.cantidad,
            detalle_venta.precio_unitario,
            detalle_venta.subtotal
        FROM ventas
        JOIN detalle_venta ON ventas.id_venta = detalle_venta.id_venta
        JOIN productos ON detalle_venta.id_producto = productos.id_producto
        WHERE ventas.id_venta = ?
    `;

    connection.query(query, [ventaId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener detalle de venta' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        res.json(results);
    });
});
module.exports = router;
