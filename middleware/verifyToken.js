const { response } = require('../config');
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const autHeader = req.headers['authorization'];
    const token = autHeader && autHeader.split(' ')[1];
    if(token == null) return response(res, { kode: '404', message: 'Tidak bisa akses halaman ini !' }, 404);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return response(res, { kode: '404', message: 'Sesi anda telah berakhir, Tidak bisa akses halaman ini !' }, 404);
        req.email = decoded.email;
        next();
    });
};

module.exports = {
    verifyToken
}