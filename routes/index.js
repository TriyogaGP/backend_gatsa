const express = require('express');
const router = express.Router();

const link = require('./route-link');

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.render('index', { title: 'Express' });
    });
    app.use('/restApi', link);
};