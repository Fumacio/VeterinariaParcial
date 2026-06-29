document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    mostrarCarrito();
});

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (producto.stock <= 0) {
        alert('Producto sin stock');
        return;
    }

    const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);

    if (productoExistente && productoExistente.cantidad >= producto.stock) {
        alert('No hay más stock disponible');
        return;
    }

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            marca: producto.marca,
            tipo_mascota: producto.tipo_mascota,

            cantidad: 1
        });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.nombre} ha sido agregado al carrito.`);
    mostrarCarrito();
}

function mostrarCarrito() {
    const carritoContainer = document.getElementById('carrito-container');
    const totalCarrito = document.getElementById('total-carrito');

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    carritoContainer.innerHTML = '';

    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p>El carrito está vacío.</p>';
        totalCarrito.textContent = 'Total: $0';
        return
    }

    let total = 0;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        const item = document.createElement('div');

        item.innerHTML = `
            <h4>${producto.nombre}</h4>
            <p>Descripción: ${producto.descripcion}</p>
            <p>Precio: $${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>

            <button onclick='eliminarDelCarrito(${producto.id_producto})'>Eliminar</button>
        `;

        carritoContainer.appendChild(item);
    });

    totalCarrito.textContent = `Total: $${total.toFixed(2)}`;
}

function eliminarDelCarrito(id_producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    carrito = carrito.filter(producto => producto.id_producto !== id_producto);


    localStorage.setItem('carrito', JSON.stringify(carrito));

    alert('Producto eliminado del carrito.');

    mostrarCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem('carrito');
    mostrarCarrito();
}

async function finalizarCompra() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        alert('el carrito esta vacio');
        return;
    }

    try {
        const response = await axios.post('http://localhost:5000/api/ventas', {
            productos: carrito
        });

        alert(`Compra registrada. Total: $${response.data.total}`);

        localStorage.removeItem('carrito');
        mostrarCarrito();
        await cargarProductos();

    } catch (error) {
        console.error(error.response.data);
        alert(error.response.data.error);
    }
}

async function cargarProductos() {
    const productosContainer = document.getElementById('productos-container');

    try {
        const response = await axios.get('http://localhost:5000/api/productos');
        const productos = response.data;

        productosContainer.innerHTML = '';

        productos.forEach(producto => {
            const card = document.createElement('div');

            card.innerHTML = `
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Stock: ${producto.stock}</p>
                <p>Marca: ${producto.marca}</p>
                <p>Para: ${producto.tipo_mascota}</p>
                <button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>
            `;

            productosContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        productosContainer.innerHTML = '<p>Error al cargar los productos</p>';
    }
}






