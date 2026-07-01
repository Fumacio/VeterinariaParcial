# TucuPet - Tienda online para mascotas

TucuPet es una aplicacion full stack simple para una tienda de productos para mascotas. Permite ver productos publicamente, agregarlos a un carrito, finalizar compras, descontar stock y administrar productos/ventas desde un panel protegido para administradores.

## Funcionalidades principales

- Catalogo publico de productos.
- Carrito de compras usando `localStorage`.
- Registro de usuarios.
- Login con JWT.
- Contrasenas hasheadas con `bcrypt`.
- Roles de usuario: `Cliente`, `Empleado`, `Administrador`.
- Panel administrador unico.
- CRUD de productos.
- Registro de ventas.
- Consulta de ventas y detalle de ventas.
- Validacion de stock.
- Descuento automatico de stock.
- Rutas protegidas por middleware.
- Separacion entre rutas y controladores.

## Tecnologias

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
- Fetch API
- localStorage

Base de datos:

- MySQL

## Estructura del proyecto

```txt
Back/
  config/
    database.js
  controllers/
    usuarios.js
    productos.js
    ventas.js
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

## Como ejecutar

1. Entrar a la carpeta del backend:

```bash
cd Back
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar `Back/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=veterinaria
PORT=5000
JWT_SECRET=mi_clave_secreta
```

4. Crear la base de datos en MySQL.

5. Iniciar el servidor:

```bash
node index.js
```

6. Abrir el frontend desde la carpeta `Front`, por ejemplo:

```txt
Front/index.html
```

## Base de datos

La base se llama:

```sql
veterinaria
```

### usuarios

Guarda los usuarios registrados.

Campos:

- `id_usuario`: ID principal.
- `nombre`: nombre del usuario.
- `email`: correo unico.
- `contraseña`: contrasena hasheada con bcrypt.
- `rol`: `Administrador`, `Empleado` o `Cliente`.

El rol por defecto es:

```sql
Cliente
```

Para convertir un usuario en administrador:

```sql
UPDATE usuarios
SET rol = 'Administrador'
WHERE email = 'correo@ejemplo.com';
```

Despues de cambiar el rol, hay que cerrar sesion y volver a iniciar sesion para generar un token nuevo.

### tipos_mascota

Guarda el tipo de mascota al que pertenece un producto.

Ejemplos:

- Perro
- Gato

### categorias

Guarda categorias de productos.

Ejemplos:

- Alimentos
- Accesorios

### marcas

Guarda marcas de productos.

Ejemplos:

- Excellent
- Whiskas
- Pedigree

### productos

Guarda los productos de la tienda.

Campos:

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

`id_categoria`, `id_marca` e `id_tipo` son claves foraneas.

### ventas

Guarda la cabecera de cada venta.

Campos:

- `id_venta`
- `fecha`
- `total`

### detalle_venta

Guarda los productos comprados en cada venta.

Campos:

- `id_detalle`
- `id_venta`
- `id_producto`
- `cantidad`
- `precio_unitario`
- `subtotal`

Una venta puede tener muchos detalles.

## Arquitectura: rutas y controladores

El proyecto usa separacion entre rutas y controladores.

Las rutas definen:

- URL
- metodo HTTP
- middlewares
- controlador que se ejecuta

Los controladores contienen:

- validaciones
- consultas SQL
- logica de negocio
- respuestas HTTP

Ejemplo:

```js
router.get('/productos', getProductos);
router.post('/productos', authMiddleware, adminMiddleware, createProducto);
```

En ese ejemplo:

- `routes/productos.js` define la ruta.
- `controllers/productos.js` contiene la funcion real.

## Controladores

### Back/controllers/usuarios.js

Funciones:

- `getUsuarios`: lista usuarios.
- `createUsuario`: crea usuario desde ruta protegida.
- `getUsuarioById`: obtiene usuario por ID.
- `login`: valida credenciales, compara bcrypt y genera JWT.
- `register`: registra usuario nuevo con contrasena hasheada.

### Back/controllers/productos.js

Funciones:

- `getProductos`: lista productos con categoria, marca y tipo de mascota.
- `getProductoById`: obtiene un producto especifico.
- `createProducto`: crea producto.
- `updateProducto`: actualiza producto.
- `deleteProducto`: elimina producto.

### Back/controllers/ventas.js

Funciones:

- `createVenta`: recibe carrito, valida stock, crea venta, crea detalle y descuenta stock.
- `getVentas`: lista ventas para el admin.
- `getVentaById`: muestra el detalle de una venta.

## Middlewares

### authMiddleware

Archivo:

```txt
Back/middleware/auth.js
```

Funcion:

```js
authMiddleware(req, res, next)
```

Hace lo siguiente:

1. Lee el header `Authorization`.
2. Extrae el token enviado como `Bearer TOKEN`.
3. Si no hay token, responde `401`.
4. Verifica el token con `jwt.verify`.
5. Si el token es invalido, responde `403`.
6. Si el token es valido, guarda los datos en `req.user`.
7. Llama a `next()`.

### adminMiddleware

Archivo:

```txt
Back/middleware/admin.js
```

Funcion:

```js
adminMiddleware(req, res, next)
```

Hace lo siguiente:

1. Revisa `req.user`.
2. Verifica que el rol sea `Administrador`.
3. Si no es administrador, responde `403`.
4. Si es administrador, llama a `next()`.

Se usa para proteger operaciones administrativas.

## Rutas del backend

Todas las rutas se montan en `Back/index.js` con:

```js
app.use('/api', router);
```

Por eso una ruta declarada como `/productos` queda disponible como:

```txt
/api/productos
```

## Usuarios

Ruta:

```txt
Back/routes/usuarios.js
```

Controlador:

```txt
Back/controllers/usuarios.js
```

### POST /api/register

Registra un usuario nuevo.

Body:

```json
{
  "nombre": "Juan",
  "email": "juan@mail.com",
  "contraseña": "123456"
}
```

Flujo:

1. Recibe nombre, email y contrasena.
2. Verifica que no falten datos.
3. Busca si el email ya existe.
4. Hashea la contrasena con bcrypt.
5. Guarda el usuario en MySQL.
6. MySQL asigna rol default `Cliente`.

### POST /api/login

Inicia sesion.

Body:

```json
{
  "email": "juan@mail.com",
  "contraseña": "123456"
}
```

Flujo:

1. Busca usuario por email.
2. Compara contrasena enviada con hash guardado.
3. Si coincide, genera JWT.
4. Devuelve `token` y `usuario`.

El token incluye:

```js
{
  id,
  email,
  rol
}
```

### GET /api/usuarios

Lista usuarios.

Protegida con:

```txt
authMiddleware
```

### GET /api/usuarios/:id

Obtiene un usuario por ID.

Protegida con:

```txt
authMiddleware
```

## Productos

Ruta:

```txt
Back/routes/productos.js
```

Controlador:

```txt
Back/controllers/productos.js
```

### GET /api/productos

Lista productos publicamente.

No requiere login porque la tienda es publica.

El controlador usa `JOIN` entre:

- productos
- categorias
- marcas
- tipos_mascota

### GET /api/productos/:id

Obtiene un producto especifico.

No requiere login.

### POST /api/productos

Crea producto.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

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

### PUT /api/productos/:id

Edita producto.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

### DELETE /api/productos/:id

Elimina producto.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

## Ventas

Ruta:

```txt
Back/routes/ventas.js
```

Controlador:

```txt
Back/controllers/ventas.js
```

### POST /api/ventas

Crea una venta desde el carrito.

No requiere login porque la tienda permite comprar publicamente.

Body:

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

Flujo:

1. Valida que el carrito no este vacio.
2. Calcula total.
3. Consulta stock real en la base.
4. Si no hay stock, devuelve error.
5. Crea una fila en `ventas`.
6. Crea filas en `detalle_venta`.
7. Descuenta stock en `productos`.
8. Devuelve `id_venta` y total.

### GET /api/ventas

Lista ventas.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

### GET /api/ventas/:id

Muestra detalle de una venta.

Protegida con:

```txt
authMiddleware
adminMiddleware
```

## Flujo de datos

### Registro

```txt
register.html
  -> register.js
  -> POST /api/register
  -> routes/usuarios.js
  -> controllers/usuarios.js
  -> bcrypt.hash()
  -> tabla usuarios
```

El dato importante es la contrasena. No se guarda en texto plano, se guarda como hash.

### Login

```txt
login.html
  -> login.js
  -> POST /api/login
  -> routes/usuarios.js
  -> controllers/usuarios.js
  -> bcrypt.compare()
  -> jwt.sign()
  -> localStorage.token
  -> localStorage.usuario
```

El token se usa despues para acceder a rutas protegidas.

### Catalogo

```txt
index.html
  -> productos.js
  -> cargarProductos()
  -> GET /api/productos
  -> routes/productos.js
  -> controllers/productos.js
  -> tabla productos + joins
  -> cards en pantalla
```

### Carrito

```txt
click Agregar al carrito
  -> agregarAlCarrito(producto)
  -> localStorage.carrito
  -> mostrarCarrito()
```

El carrito vive en el navegador hasta que se finaliza la compra.

### Compra

```txt
click Finalizar compra
  -> finalizarCompra()
  -> POST /api/ventas
  -> routes/ventas.js
  -> controllers/ventas.js
  -> valida stock
  -> ventas
  -> detalle_venta
  -> update productos.stock
  -> borra localStorage.carrito
```

### Admin productos

```txt
admin.html
  -> admin.js
  -> token + usuario.rol
  -> POST/PUT/DELETE /api/productos
  -> authMiddleware
  -> adminMiddleware
  -> controllers/productos.js
  -> tabla productos
```

### Admin ventas

```txt
admin.html
  -> admin.js
  -> GET /api/ventas
  -> authMiddleware
  -> adminMiddleware
  -> controllers/ventas.js
  -> tabla ventas
```

## Frontend

### Front/index.html

Pagina publica de la tienda.

Contiene:

- titulo
- navegacion
- productos
- carrito
- contacto
- login/register
- link admin si el usuario es administrador

### Front/productos.js

Funciones:

- `cargarProductos()`: pide productos al backend y dibuja cards.
- `agregarAlCarrito(producto)`: guarda producto en carrito.
- `mostrarCarrito()`: muestra carrito y total.
- `eliminarDelCarrito(id_producto)`: elimina producto del carrito.
- `vaciarCarrito()`: borra todo el carrito.
- `finalizarCompra()`: envia carrito al backend y registra venta.

### Front/login.js

Funciones principales:

- toma email y contrasena del formulario
- envia `POST /api/login`
- guarda `token`
- guarda `usuario`
- redirige al index

### Front/register.js

Funciones principales:

- toma nombre, email y contrasena
- envia `POST /api/register`
- redirige al login si el registro fue correcto

### Front/admin.html

Panel administrador unico.

Secciones:

- Productos
- Ventas

### Front/admin.js

Funciones:

- `mostrarSeccion(seccion)`: cambia entre productos y ventas.
- `cargarProductosAdmin()`: carga tabla de productos.
- `obtenerDatosFormulario()`: lee formulario de productos.
- `cargarProductoEnFormulario(producto)`: prepara edicion.
- `eliminarProducto(idProducto)`: elimina producto.
- `cargarVentasAdmin()`: carga tabla de ventas.
- `verDetalleVenta(idVenta)`: muestra detalle de venta.

## Seguridad

### Bcrypt

Al registrar:

```js
bcrypt.hash(contrasena, 10)
```

Al iniciar sesion:

```js
bcrypt.compare(contrasena, user.contraseña)
```

### JWT

El token guarda:

```js
{
  id,
  email,
  rol
}
```

Se envia en rutas protegidas asi:

```txt
Authorization: Bearer TOKEN
```

### Roles

- `Cliente`: puede comprar y usar la tienda.
- `Empleado`: disponible para ampliar.
- `Administrador`: puede entrar al panel admin.

## Pruebas recomendadas

### Registro/login

1. Registrar usuario nuevo.
2. Verificar en MySQL que `contraseña` sea un hash.
3. Iniciar sesion.
4. Verificar `localStorage.token`.
5. Verificar `localStorage.usuario`.

### Admin

1. Cambiar rol del usuario a `Administrador`.
2. Cerrar sesion.
3. Volver a iniciar sesion.
4. Entrar a `admin.html`.
5. Crear producto.
6. Editar producto.
7. Eliminar producto.
8. Ver ventas.
9. Ver detalle de venta.

### Compra

1. Entrar a `index.html`.
2. Agregar productos al carrito.
3. Finalizar compra.
4. Verificar tabla `ventas`.
5. Verificar tabla `detalle_venta`.
6. Verificar descuento de stock.
7. Intentar comprar mas que el stock disponible.

## Estado actual

Implementado:

- Catalogo publico.
- Carrito.
- Registro.
- Login.
- Bcrypt.
- JWT.
- Roles.
- Middlewares.
- Controllers.
- CRUD productos.
- Registro de ventas.
- Consulta de ventas.
- Detalle de ventas.
- Descuento de stock.
- Panel admin unico.

Pendiente opcional:

- Mejorar estilos.
- Agregar buscador.
- Agregar filtros.
- Reemplazar IDs numericos del admin por selects.
- Agregar comprobante de compra.
- Usar transacciones SQL si se quisiera hacer mas robusto.

## Notas

- La tienda permite comprar sin login.
- El admin requiere rol `Administrador`.
- Si se cambia el rol en la base, hay que cerrar sesion y volver a iniciar sesion.
- Usuarios antiguos con contrasena en texto plano no podran iniciar sesion despues de activar bcrypt.
- No se recomienda subir `.env` a GitHub.
