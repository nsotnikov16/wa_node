const mysql = require("mysql2");
const dbConfig = require("../config/db.js");

const connection = mysql.createConnection({
    connectionLimit: 5,
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

connection.connect(err => {
    if (err) throw new Error(err);
    console.log('Successful connection to the database');
});

connection.querypr = async (query) => new Promise((resolve, reject) => db.query(query, (err, data) => {
    if (err) return reject(err);
    resolve(data);
}))

module.exports = connection;
