const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const koneksi = require('./config/db');
const logger = require('morgan');
const dotenv = require('dotenv');
const { response } = require('./config');
const cors = require('cors');
dotenv.config();
const indexRouter = require('./routes/index');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({credentials:true, origin:'http://localhost:3000'}));

indexRouter(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err.message : 'Terjadi kesalahan';

    // render the error page
    response(res, { "result": { 'kode': err.kode || 406, 'keterangan': err.message } }, err.kode || 406);
});

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

module.exports = app;