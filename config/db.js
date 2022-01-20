const mysql = require('mysql');
// buat konfigurasi koneksi
const koneksi = mysql.createConnection({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE || "db_gatsa_web",
    multipleStatements: true
});
// koneksi database
koneksi.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});
module.exports = koneksi;