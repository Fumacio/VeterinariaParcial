const mysql2 = require('mysql2');
require('dotenv').config();

const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}); 

// connection.connect((err) => {
//     if (err) throw err;
//     console.log('Conexión a la base de datos establecida');
// });


module.exports = { connection };