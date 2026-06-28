document.addEventListener('DOMContentLoaded', async () => {
    const productosContainer = document.getElementById('productos-container');

    try {
        const response = await axios.get('http://localhost:5000/api/productos');
        const productos = response.data;

        productosContainer.innerHTML = ' '; 

        productos.forEach(producto => {
            const card = document.createElement('div');

            card.innerHTML = 
                `<h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Marca: ${producto.marca}</p>
                <p>Para: ${producto.tipo_mascota}</p>
                <button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>`;

            productosContainer.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        productosContainer.innerHTML = '<p>Error al cargar los productos</p>';
    }
});

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            marca: producto.marca,
            tipo_mascota: producto.tipo_mascota,
            
            cantidad: 1
        });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.nombre} ha sido agregado al carrito.`);
}

function mostrarCarrito() {
    
}
