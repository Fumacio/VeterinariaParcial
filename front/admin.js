const API_PRODUCTOS = 'http://localhost:5000/api/productos';
const API_VENTAS = 'http://localhost:5000/api/ventas';
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario')) || null;

if (!token || !usuario || usuario.rol !== 'Administrador') {
    alert('Debes ser administrador para entrar al panel');
    window.location.href = 'login.html';
}

const form = document.getElementById('form-producto');
const tablaProductos = document.getElementById('tabla-productos');
const tablaVentas = document.getElementById('tabla-ventas');
const detalleVenta = document.getElementById('detalle-venta');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnCancelar = document.getElementById('btn-cancelar');
const seccionProductos = document.getElementById('seccion-productos');
const seccionVentas = document.getElementById('seccion-ventas');

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductosAdmin();
    await cargarVentasAdmin();
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const idProducto = document.getElementById('id_producto').value;
    const producto = obtenerDatosFormulario();

    try {
        const url = idProducto ? `${API_PRODUCTOS}/${idProducto}` : API_PRODUCTOS;
        const method = idProducto ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Error al guardar producto');
            return;
        }

        alert(data.message);
        limpiarFormulario();
        cargarProductosAdmin();
    } catch (error) {
        console.error(error);
        alert('Error al guardar producto');
    }
});

btnCancelar.addEventListener('click', limpiarFormulario);

function mostrarSeccion(seccion) {
    seccionProductos.hidden = seccion !== 'productos';
    seccionVentas.hidden = seccion !== 'ventas';
}

async function cargarProductosAdmin() {
    try {
        const response = await fetch(API_PRODUCTOS);
        const productos = await response.json();

        tablaProductos.innerHTML = '';

        productos.forEach(producto => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${producto.id_producto}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.stock}</td>
                <td>${producto.categoria}</td>
                <td>${producto.marca}</td>
                <td>
                    <button onclick='cargarProductoEnFormulario(${JSON.stringify(producto)})'>Editar</button>
                    <button onclick='eliminarProducto(${producto.id_producto})'>Eliminar</button>
                </td>
            `;

            tablaProductos.appendChild(fila);
        });
    } catch (error) {
        console.error(error);
        tablaProductos.innerHTML = '<tr><td colspan="7">Error al cargar productos</td></tr>';
    }
}

function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: Number(document.getElementById('precio').value),
        stock: Number(document.getElementById('stock').value),
        imagen: document.getElementById('imagen').value || null,
        fecha_vencimiento: document.getElementById('fecha_vencimiento').value || null,
        id_categoria: Number(document.getElementById('id_categoria').value),
        id_marca: Number(document.getElementById('id_marca').value),
        id_tipo: Number(document.getElementById('id_tipo').value)
    };
}

function cargarProductoEnFormulario(producto) {
    document.getElementById('id_producto').value = producto.id_producto;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('imagen').value = producto.imagen || '';
    document.getElementById('fecha_vencimiento').value = producto.fecha_vencimiento
        ? producto.fecha_vencimiento.slice(0, 10)
        : '';
    document.getElementById('id_categoria').value = producto.id_categoria;
    document.getElementById('id_marca').value = producto.id_marca;
    document.getElementById('id_tipo').value = producto.id_tipo;

    tituloFormulario.textContent = 'Editar producto';
    mostrarSeccion('productos');
}

async function eliminarProducto(idProducto) {
    const confirmar = confirm('Seguro que queres eliminar este producto?');

    if (!confirmar) {
        return;
    }

    try {
        const response = await fetch(`${API_PRODUCTOS}/${idProducto}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Error al eliminar producto');
            return;
        }

        alert(data.message);
        cargarProductosAdmin();
    } catch (error) {
        console.error(error);
        alert('Error al eliminar producto');
    }
}

function limpiarFormulario() {
    form.reset();
    document.getElementById('id_producto').value = '';
    tituloFormulario.textContent = 'Crear producto';
}

async function cargarVentasAdmin() {
    try {
        const response = await fetch(API_VENTAS, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const ventas = await response.json();

        tablaVentas.innerHTML = '';

        ventas.forEach(venta => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${venta.id_venta}</td>
                <td>${venta.fecha}</td>
                <td>$${venta.total}</td>
                <td>
                    <button onclick="verDetalleVenta(${venta.id_venta})">Ver detalle</button>
                </td>
            `;

            tablaVentas.appendChild(fila);
        });
    } catch (error) {
        console.error(error);
        tablaVentas.innerHTML = '<tr><td colspan="4">Error al cargar ventas</td></tr>';
    }
}

async function verDetalleVenta(idVenta) {
    try {
        const response = await fetch(`${API_VENTAS}/${idVenta}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const detalles = await response.json();

        if (!response.ok) {
            detalleVenta.innerHTML = `<p>${detalles.error || 'Error al obtener detalle'}</p>`;
            return;
        }

        let html = `
            <h3>Venta #${idVenta}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;

        detalles.forEach(detalle => {
            html += `
                <tr>
                    <td>${detalle.producto}</td>
                    <td>${detalle.cantidad}</td>
                    <td>$${detalle.precio_unitario}</td>
                    <td>$${detalle.subtotal}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        detalleVenta.innerHTML = html;
    } catch (error) {
        console.error(error);
        detalleVenta.innerHTML = '<p>Error al obtener detalle de venta</p>';
    }
}
