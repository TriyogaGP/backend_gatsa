var express = require('express');
var router = express.Router();
const { verifyToken } = require('../../middleware/verifyToken.js');
const { uploadFile } = require('../../middleware/uploadFile.js');
const { uploadBerkas } = require('../../middleware/uploadBerkas.js');
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
    .post('/updateBerkas', uploadBerkas, c_user.updateBerkas)
    .get('/downloadexcel/:roleid', c_user.downloadexcel)
    .get('/exportexcel/:cari', c_user.exportexcel)
    .get('/getkelas', c_user.getkelas)
    .post('/ambilKelas', c_user.ambilKelas)
    .get('/detailUserPDF/:id', c_user.detailUserPDF)
    .get('/dataDashboard', c_user.dataDashboard)
    .get('/kelasSiswa/:kelas', c_user.kelasSiswa)
    .get('/penilaian', c_user.penilaianSiswa)
    .post('/ubahPenilaian', c_user.ubahPenilaian)
    .post('/jadwalNgajar', c_user.jadwalNgajar)
    .get('/getjadwalNgajar/:id', c_user.getjadwalNgajar)
    .delete('/jadwalNgajar/:id_jadwal', c_user.deletejadwalNgajar)
    
    module.exports = router;