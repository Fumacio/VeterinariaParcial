const express = require('express');
const router = express.Router();

const { connection } = require('../config/database');

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
    })









    module.exports = router;