const express = require('express');
const cors = require('cors');

const usuarios = require('./routes/usuarios');
const productos = require('./routes/productos');

const { connection } = require('./config/database');


const app = express();

app.use(cors());
app.use(express.json());
app.use ('/api', usuarios);
app.use ('/api', productos);

app.get('/api', (req, res) => {
    res.send({ message: 'Bienvenido a la API de la veterinaria tucupet' });
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conexión a la base de datos establecida');
});


app.listen(process.env.PORT, () => {
    console.log('Servidor iniciado en el puerto ' + process.env.PORT);
});







