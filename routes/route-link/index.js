const express = require('express');
const router = express.Router();

const login = require('./login');
const user = require('./user');

router
    .use('/moduleLogin', login)
    .use('/moduleUser', user)

module.exports = router