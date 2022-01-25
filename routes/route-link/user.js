var express = require('express');
var router = express.Router();
const { verifyToken } = require('../../middleware/verifyToken.js');
const { uploadFile } = require('../../middleware/uploadFile.js');
const { c_user } = require('../../controllers');

router
    .get('/getusers', verifyToken, c_user.readData)
    .post('/createupdateusers', c_user.createupdateData)
    .post('/updateuserby', c_user.updateDataBY)
    .delete('/getusers/:id', c_user.deleteData)
    .get('/verifikasi/:kode/:activeAkun', c_user.verifikasi)
    .post('/updatekodepos', c_user.updateKodePos)
    .get('/getprovinsi', c_user.readDataProvinsi)
    .get('/getkabkotaonly', c_user.readDataKabKotaOnly)
    .get('/getkabkota/:id', c_user.readDataKabKota)
    .get('/getkecamatan/:id', c_user.readDataKecamatan)
    .get('/getkeldesa/:id', c_user.readDataKelDesa)
    .post('/updateFile', uploadFile, c_user.updateFile)
    // .get('/getusers/:id', verifyToken, c_user.readDataByID)
    
module.exports = router;