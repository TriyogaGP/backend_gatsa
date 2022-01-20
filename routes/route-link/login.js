var express = require('express');
var router = express.Router();
const { verifyToken } = require('../../middleware/verifyToken.js');
const { uploadFile } = require('../../middleware/uploadFile.js');
const { c_login } = require('../../controllers');

router
    .get('/getdatausers/:idRole', verifyToken, c_login.readData)
    .post('/updateusers', c_login.updateData)
    .get('/getusers/:id', verifyToken, c_login.readDataByID)
    .get('/getuserslock/:id', c_login.readDataByIDLock)
    .post('/register', c_login.register)
    .post('/confirmation', c_login.confirmation)
    .get('/token/:id', c_login.refreshToken)
    .post('/login', c_login.login)
    .post('/loginBygmail', c_login.loginByGmail)
    .post('/postImage', c_login.postImage)
    .post('/updateImage', uploadFile, c_login.updateImage)
    .get('/logout/:id', c_login.logout)

module.exports = router;