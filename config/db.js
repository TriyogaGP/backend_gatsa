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
	if (err) return handleDisconnect()
	console.log('MySQL Connected...');
});

function handleDisconnect() {
	connection = mysql.createConnection({
		host: process.env.HOST || "localhost",
		user: process.env.USER || "root",
		password: process.env.PASSWORD || "",
		database: process.env.DATABASE || "db_gatsa",
		multipleStatements: true
	});

	connection.connect(function(err) {
		if(err) {                       
			console.log('error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000);
		}                                    
	});                                    
	connection.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
			handleDisconnect();                         
		} else {                                      
			throw err;
		}
	});
}

handleDisconnect()

module.exports = koneksi;