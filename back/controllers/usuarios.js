const {connection} = require('../config/database');

const getUsers = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuarios';
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = { getUsers };

