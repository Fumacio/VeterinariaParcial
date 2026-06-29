# TucuPet - Tienda online para mascotas

Proyecto full stack simple para una tienda veterinaria / pet shop. La aplicacion permite ver productos publicamente, agregarlos a un carrito, finalizar una compra, descontar stock y administrar productos/ventas desde un panel protegido para administradores.

## Objetivo del proyecto

El objetivo es simular una tienda online de productos para mascotas. El sistema cubre:

- Catalogo publico de productos.
- Carrito de compras en el navegador.
- Registro e inicio de sesion.
- Roles de usuario.
- Panel administrador.
- Gestion de productos.
- Gestion/consulta de ventas.
- Control basico de stock.
- Hash de contrasenas con bcrypt.
- Autenticacion con JWT.

## Tecnologias utilizadas

Backend:

- Node.js
- Express
- MySQL / mysql2
- dotenv
- cors
- jsonwebtoken
- bcrypt

Frontend:

- HTML
- CSS
- JavaScript
- Axios
- localStorage

Base de datos:

- MySQL

## Estructura general

```txt
Back/
  config/
    database.js
  middleware/
    auth.js
    admin.js
  routes/
    usuarios.js
    productos.js
    ventas.js
  index.js
  .env

Front/
  index.html
  productos.js
  login.html
  login.js
  register.html
  register.js
  admin.html
  admin.js
  admin.css
  login.css
  index.css
```

## Como ejecutar el proyecto

1. Instalar dependencias del backend:

```bash
cd Back
npm install
```

2. Configurar el archivo `Back/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=veterinaria
PORT=5000
JWT_SECRET=mi_clave_secreta
```

3. Crear la base de datos en MySQL.

4. Iniciar el backend:

```bash
node index.js
```

5. Abrir el frontend desde la carpeta `Front`, por ejemplo:

```txt
Front/index.html
```

## Base de datos

La base de datos principal se llama:

```sql
veterinaria
```

### Tabla usuarios

Guarda los usuarios registrados.

Campos principales:

- `id_usuario`: identificador unico.
- `nombre`: nombre del usuario.
- `email`: correo unico.
- `contraseña`: contrasena hasheada con bcrypt.
- `rol`: puede ser `Administrador`, `Empleado` o `Cliente`.

El rol por defecto debe ser:

```sql
Cliente
```

Esto permite que cualquier usuario registrado sea cliente normal, mientras que solo los usuarios con rol `Administrador` pueden entrar al panel admin.

Para convertir un usuario en administrador:

```sql
UPDATE usuarios
SET rol = 'Administrador'
WHERE email = 'correo@ejemplo.com';
```

Despues de cambiar el rol, el usuario debe cerrar sesion y volver a iniciar sesion para recibir un token nuevo con el rol actualizado.

### Tabla tipos_mascota

Guarda los tipos de mascota a los que apunta un producto.

Ejemplos:

- Perro
- Gato

### Tabla categorias

Guarda categorias de productos.

Ejemplos:

- Alimentos
- Accesorios

### Tabla marcas

Guarda marcas de productos.

Ejemplos:

- Excellent
- Whiskas
- Pedigree

### Tabla productos

Guarda los productos de la tienda.

Campos principales:

- `id_producto`
- `nombre`
- `descripcion`
- `precio`
- `stock`
- `imagen`
- `fecha_vencimiento`
- `id_categoria`
- `id_marca`
- `id_tipo`

Los campos `id_categoria`, `id_marca` e `id_tipo` conectan cada producto con su categoria, marca y tipo de mascota.

### Tabla ventas

Guarda la cabecera de cada venta.

Campos:

- `id_venta`
- `fecha`
- `total`

### Tabla detalle_venta

Guarda los productos incluidos en cada venta.

Campos:

- `id_detalle`
- `id_venta`
- `id_producto`
- `cantidad`
- `precio_unitario`
- `subtotal`

Una venta puede tener muchos detalles. Cada detalle representa un producto comprado.

## Flujo general de datos

### 1. Flujo de carga de productos

1. El usuario entra a `Front/index.html`.
2. El archivo `Front/productos.js` ejecuta `cargarProductos()`.
3. `cargarProductos()` hace una peticion:

```txt
GET http://localhost:5000/api/productos
```

4. El backend recibe la peticion en `Back/routes/productos.js`.
5. La ruta consulta MySQL usando `JOIN` entre:

```txt
productos
categorias
marcas
tipos_mascota
```

6. El backend devuelve un array JSON con los productos.
7. El frontend recorre ese array y crea una card HTML para cada producto.
8. Cada card muestra nombre, descripcion, precio, stock, marca y tipo de mascota.
9. Cada card tiene un boton `Agregar al carrito`.

### 2. Flujo de carrito

1. El usuario hace click en `Agregar al carrito`.
2. Se ejecuta la funcion:

```js
agregarAlCarrito(producto)
```

3. La funcion lee el carrito desde `localStorage`.
4. Si el producto no existe en el carrito, lo agrega con `cantidad: 1`.
5. Si el producto ya existe, aumenta la cantidad.
6. Antes de sumar, valida que no se supere el stock disponible.
7. Guarda el carrito actualizado en:

```txt
localStorage.carrito
```

8. Llama a:

```js
mostrarCarrito()
```

9. `mostrarCarrito()` dibuja los productos del carrito, muestra cantidad, subtotal y total.

El carrito se guarda en el navegador, no en la base de datos. Por eso se usa `localStorage`.

### 3. Flujo de finalizar compra

1. El usuario presiona `Finalizar compra`.
2. Se ejecuta:

```js
finalizarCompra()
```

3. La funcion lee el carrito desde `localStorage`.
4. Si esta vacio, muestra un mensaje y corta.
5. Si tiene productos, envia una peticion al backend:

```txt
POST http://localhost:5000/api/ventas
```

con un body como:

```json
{
  "productos": [
    {
      "id_producto": 1,
      "nombre": "Alimento Excellent Perro Adulto 15kg",
      "precio": 32000,
      "cantidad": 2
    }
  ]
}
```

6. El backend recibe la peticion en `Back/routes/ventas.js`.
7. Primero valida que el carrito no este vacio.
8. Calcula el total.
9. Consulta el stock actual de los productos en la base.
10. Si algun producto no existe, responde error.
11. Si alguna cantidad supera el stock disponible, responde:

```txt
Stock insuficiente
```

12. Si todo esta bien:

- crea una fila en `ventas`
- crea una o varias filas en `detalle_venta`
- descuenta stock en `productos`

13. El backend responde con el `id_venta` y el total.
14. El frontend muestra un mensaje de compra registrada.
15. El frontend borra el carrito del `localStorage`.
16. El frontend vuelve a cargar productos para mostrar el stock actualizado.

### 4. Flujo de registro

1. El usuario entra a `Front/register.html`.
2. Completa nombre, email y contrasena.
3. `Front/register.js` envia:

```txt
POST http://localhost:5000/api/register
```

4. El backend recibe la peticion en `Back/routes/usuarios.js`.
5. Verifica si el email ya existe.
6. Si existe, devuelve error.
7. Si no existe, usa bcrypt para hashear la contrasena:

```js
bcrypt.hash(contraseña, 10)
```

8. Guarda el usuario en MySQL.
9. Como no se envia rol, MySQL asigna el default:

```txt
Cliente
```

10. El frontend avisa que el registro fue exitoso y redirige al login.

### 5. Flujo de login

1. El usuario entra a `Front/login.html`.
2. Ingresa email y contrasena.
3. `Front/login.js` envia:

```txt
POST http://localhost:5000/api/login
```

4. El backend busca el usuario por email.
5. Si no existe, devuelve error.
6. Si existe, compara la contrasena ingresada contra el hash guardado:

```js
bcrypt.compare(contraseña, user.contraseña)
```

7. Si no coincide, devuelve error.
8. Si coincide, genera un token JWT:

```js
jwt.sign(
  { id: user.id_usuario, email: user.email, rol: user.rol },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)
```

9. El backend responde con:

- `token`
- datos del `usuario`

10. El frontend guarda ambos en `localStorage`:

```txt
localStorage.token
localStorage.usuario
```

11. El usuario queda autenticado.

### 6. Flujo de panel administrador

1. El usuario inicia sesion.
2. Si el usuario tiene rol `Administrador`, en `index.html` aparece el link `Admin`.
3. El link lleva a:

```txt
Front/admin.html
```

4. `Front/admin.js` revisa:

```js
localStorage.getItem('token')
JSON.parse(localStorage.getItem('usuario')).rol
```

5. Si no hay token o el rol no es `Administrador`, redirige a login.
6. Si es administrador, carga:

- productos
- ventas

7. Desde el panel se puede:

- crear producto
- editar producto
- eliminar producto
- ver ventas
- ver detalle de una venta

8. Las rutas sensibles tambien estan protegidas en backend con:

```js
authMiddleware
adminMiddleware
```

Esto es importante porque ocultar botones en frontend no alcanza. La seguridad real esta en el backend.

## Middlewares

### `authMiddleware`

Archivo:

```txt
Back/middleware/auth.js
```

Funcion:

```js
authMiddleware(req, res, next)
```

Que hace:

1. Lee el header:

```txt
Authorization: Bearer TOKEN
```

2. Extrae el token.
3. Si no hay token, responde:

```txt
401 Token no proporcionado
```

4. Verifica el token con `jwt.verify`.
5. Si el token es invalido, responde:

```txt
403 Token invalido
```

6. Si el token es valido, guarda los datos en:

```js
req.user
```

7. Llama a `next()` para dejar pasar la peticion.

Se usa en rutas que requieren usuario autenticado.

### `adminMiddleware`

Archivo:

```txt
Back/middleware/admin.js
```

Funcion:

```js
adminMiddleware(req, res, next)
```

Que hace:

1. Revisa `req.user`.
2. Verifica que el rol sea:

```txt
Administrador
```

3. Si no es administrador, responde:

```txt
403 Acceso solo para administradores
```

4. Si es administrador, llama a `next()`.

Se usa para proteger acciones administrativas.

## Rutas del backend

Todas las rutas se montan en `Back/index.js` bajo:

```txt
/api
```

Por ejemplo, si en un router existe:

```txt
/productos
```

la URL final es:

```txt
/api/productos
```

### Usuarios

Archivo:

```txt
Back/routes/usuarios.js
```

#### `POST /api/register`

Registra un usuario nuevo.

Body:

```json
{
  "nombre": "Juan",
  "email": "juan@mail.com",
  "contraseña": "123456"
}
```

Proceso:

- valida datos
- verifica email repetido
- hashea contrasena con bcrypt
- guarda usuario
- rol default: Cliente

#### `POST /api/login`

Inicia sesion.

Body:

```json
{
  "email": "juan@mail.com",
  "contraseña": "123456"
}
```

Proceso:

- busca usuario
- compara contrasena con bcrypt
- genera token JWT
- devuelve usuario y token

#### `GET /api/usuarios`

Lista usuarios.

Protegida con:

```txt
authMiddleware
```

#### `GET /api/usuarios/:id`

Devuelve un usuario por ID.

Protegida con:

```txt
authMiddleware
```

### Productos

Archivo:

```txt
Back/routes/productos.js
```

#### `GET /api/productos`

Lista productos publicamente.

Incluye datos de:

- categoria
- marca
- tipo de mascota

No requiere login porque la tienda es publica.

#### `GET /api/productos/:id`

Devuelve un producto especifico.

No requiere login.

#### `POST /api/productos`

Crea un producto.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

Solo puede usarla un administrador.

Body:

```json
{
  "nombre": "Shampoo para perro",
  "descripcion": "Shampoo perfumado",
  "precio": 4500,
  "stock": 10,
  "imagen": "shampoo.jpg",
  "fecha_vencimiento": null,
  "id_categoria": 2,
  "id_marca": 3,
  "id_tipo": 1
}
```

#### `PUT /api/productos/:id`

Edita un producto.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

#### `DELETE /api/productos/:id`

Elimina un producto.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

### Ventas

Archivo:

```txt
Back/routes/ventas.js
```

#### `POST /api/ventas`

Crea una venta desde el carrito.

No requiere login porque la tienda permite comprar publicamente.

Proceso:

- valida carrito
- valida stock
- crea venta
- crea detalle
- descuenta stock

#### `GET /api/ventas`

Lista ventas.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

Solo administradores.

#### `GET /api/ventas/:id`

Muestra detalle de una venta.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

Solo administradores.

## Frontend

### `Front/index.html`

Es la pagina principal de la tienda.

Contiene:

- titulo
- navegacion
- carrito
- listado de productos
- contacto
- link a login
- link a register
- link a admin si el usuario es administrador

Es publica. No exige login.

### `Front/productos.js`

Controla el catalogo, carrito y compra.

Funciones principales:

#### `cargarProductos()`

Pide los productos al backend:

```txt
GET /api/productos
```

Luego crea las cards en el HTML.

Se ejecuta al cargar la pagina.

#### `agregarAlCarrito(producto)`

Agrega un producto al carrito.

Usa:

```txt
localStorage.carrito
```

Valida:

- producto sin stock
- cantidad mayor al stock

Despues llama a:

```js
mostrarCarrito()
```

#### `mostrarCarrito()`

Lee el carrito desde `localStorage` y lo muestra en pantalla.

Calcula:

- cantidad
- subtotal
- total

#### `eliminarDelCarrito(id_producto)`

Elimina un producto del carrito usando su ID.

#### `vaciarCarrito()`

Borra todo el carrito.

#### `finalizarCompra()`

Envia el carrito al backend:

```txt
POST /api/ventas
```

Si la venta se registra:

- muestra mensaje
- borra carrito
- actualiza productos para mostrar nuevo stock

### `Front/login.html` y `Front/login.js`

Pantalla y logica de inicio de sesion.

`login.js`:

- toma email y contrasena
- envia `POST /api/login`
- guarda `token`
- guarda `usuario`
- redirige al index

### `Front/register.html` y `Front/register.js`

Pantalla y logica de registro.

`register.js`:

- toma nombre, email y contrasena
- envia `POST /api/register`
- si sale bien, redirige al login

### `Front/admin.html`

Panel unico de administracion.

Tiene dos secciones:

- Productos
- Ventas

### `Front/admin.js`

Controla el panel administrador.

Funciones principales:

#### Validacion inicial

Al cargar, revisa:

```js
token
usuario.rol
```

Si no hay token o el rol no es `Administrador`, redirige al login.

#### `mostrarSeccion(seccion)`

Muestra la seccion de productos o ventas.

#### `cargarProductosAdmin()`

Lista productos en una tabla.

Usa:

```txt
GET /api/productos
```

#### `obtenerDatosFormulario()`

Lee los campos del formulario de producto y arma un objeto JS.

#### `cargarProductoEnFormulario(producto)`

Carga datos de un producto en el formulario para editar.

#### Submit del formulario

Si no hay `id_producto`, crea:

```txt
POST /api/productos
```

Si hay `id_producto`, edita:

```txt
PUT /api/productos/:id
```

Ambas peticiones mandan:

```txt
Authorization: Bearer token
```

#### `eliminarProducto(idProducto)`

Elimina un producto:

```txt
DELETE /api/productos/:id
```

#### `cargarVentasAdmin()`

Lista ventas:

```txt
GET /api/ventas
```

Requiere token de administrador.

#### `verDetalleVenta(idVenta)`

Muestra el detalle de una venta:

```txt
GET /api/ventas/:id
```

## Autenticacion y roles

El sistema usa JWT.

Cuando un usuario inicia sesion, el backend crea un token con:

```js
{
  id,
  email,
  rol
}
```

Ese token se guarda en:

```txt
localStorage.token
```

Y los datos del usuario en:

```txt
localStorage.usuario
```

Roles:

- `Cliente`: usuario normal.
- `Empleado`: rol disponible para extender el sistema.
- `Administrador`: puede entrar al panel admin y modificar productos/ver ventas.

El frontend oculta el boton admin si el usuario no es administrador, pero la seguridad real esta en el backend con `adminMiddleware`.

## Seguridad implementada

### Bcrypt

Las contrasenas no se guardan como texto plano.

Al registrar:

```js
bcrypt.hash(contraseña, 10)
```

Al iniciar sesion:

```js
bcrypt.compare(contraseña, user.contraseña)
```

### JWT

Se usa para autenticar usuarios y proteger rutas.

### Middleware de administrador

Evita que usuarios no administradores puedan:

- crear productos
- editar productos
- eliminar productos
- ver ventas
- ver detalle de ventas

## Datos principales y hacia donde van

### Producto

Origen:

- base de datos `productos`

Ruta:

```txt
Back/routes/productos.js
```

Destino:

- `Front/index.html`
- `Front/admin.html`

Uso:

- mostrar catalogo
- agregar al carrito
- administrar stock/precio/datos

### Carrito

Origen:

- acciones del usuario en `index.html`

Lugar donde se guarda:

```txt
localStorage.carrito
```

Destino:

- `POST /api/ventas`

Uso:

- preparar compra
- calcular total
- enviar productos al backend

### Venta

Origen:

- carrito enviado desde frontend

Ruta:

```txt
POST /api/ventas
```

Destino:

- tabla `ventas`
- tabla `detalle_venta`
- tabla `productos` para descontar stock

Uso:

- registrar compra
- consultar ventas desde admin

### Usuario

Origen:

- formulario de registro/login

Rutas:

```txt
POST /api/register
POST /api/login
```

Destino:

- tabla `usuarios`
- `localStorage.token`
- `localStorage.usuario`

Uso:

- login
- roles
- acceso admin

## Pruebas recomendadas

### Registro y login

1. Registrar usuario nuevo.
2. Ver en la base que la contrasena esta hasheada.
3. Iniciar sesion.
4. Confirmar que se guarda `token` y `usuario` en localStorage.

### Admin

1. Cambiar el rol del usuario a `Administrador`.
2. Cerrar sesion.
3. Volver a iniciar sesion.
4. Entrar al panel admin.
5. Crear producto.
6. Editar producto.
7. Eliminar producto.

### Compra

1. Entrar al index como visitante o usuario.
2. Agregar productos al carrito.
3. Finalizar compra.
4. Confirmar que se crea una fila en `ventas`.
5. Confirmar que se crean filas en `detalle_venta`.
6. Confirmar que baja el stock.
7. Intentar comprar mas que el stock disponible y verificar que el sistema lo impide.

### Ventas admin

1. Entrar como administrador.
2. Abrir admin.
3. Ir a Ventas.
4. Ver lista de ventas.
5. Abrir detalle de una venta.

## Estado actual del proyecto

Implementado:

- Catalogo publico.
- Carrito con localStorage.
- Registro.
- Login.
- JWT.
- Roles.
- Bcrypt.
- Admin unico.
- CRUD de productos.
- Registro de ventas.
- Detalle de ventas.
- Descuento de stock.
- Validacion de stock.
- Restriccion de admin en backend.

Pendiente opcional:

- Mejorar estilos visuales.
- Agregar filtros de productos por categoria/marca/tipo.
- Agregar buscador.
- Mejorar formularios con selects en lugar de IDs numericos.
- Agregar comprobante visual de compra.
- Usar transacciones SQL para ventas en un sistema real.

## Notas importantes

- La tienda permite comprar sin login.
- El admin requiere rol `Administrador`.
- Si se cambia el rol de un usuario en la base, hay que cerrar sesion y volver a iniciar sesion.
- Si se activa bcrypt en una base que ya tenia usuarios con contrasena en texto plano, esos usuarios viejos no podran iniciar sesion hasta actualizar su contrasena con hash o registrarlos nuevamente.
- No se recomienda subir `.env` a GitHub.
