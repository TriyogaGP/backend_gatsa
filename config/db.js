const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

// buat konfigurasi koneksi
const koneksi = mysql.createConnection({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE || "db_gatsa",
    multipleStatements: true
});
// koneksi database
koneksi.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});
module.exports = koneksi;