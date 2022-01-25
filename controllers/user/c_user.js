const { m_user } = require('../../models');
const readXlsxFile = require('read-excel-file/node');

error = {}

const readData = (req, res) => {
    // buat query sql
    const querySql = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, 
        DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
        c.*, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
        INNER JOIN roleUsers AS b ON a.roleID=b.id 
        INNER JOIN users_details AS c ON a.id=c.id_profile
        WHERE a.roleID = ? && a.id != ? ORDER BY item_no ASC`;
    
    // masukkan ke dalam model
    m_user.getUsers(res, querySql, req.query);
};

const createupdateData = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT a.*, b.* FROM users AS a INNER JOIN users_details AS b ON a.id=b.id_profile WHERE a.email = ? OR b.nomor_induk = ?';
    const queryCheck2 = 'SELECT * FROM users WHERE email = ?';
    const querySqlUsers = data.id !== null ? 'UPDATE users SET ? WHERE id = ?' : 'INSERT INTO users SET ?';
    const querySqlUsersDetails = data.id !== null ? 'UPDATE users_details SET ? WHERE id_profile = ?' : 'INSERT INTO users_details SET ?';
    
    // // masukkan ke dalam model
    m_user.createupdateUsers(res, queryCheck, queryCheck2, querySqlUsers, querySqlUsersDetails, data);
};

const updateDataBY = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT * FROM users WHERE id = ?';
    const querySql = 'UPDATE users SET ? WHERE id = ?';
    
    // masukkan ke dalam model
    m_user.updateUserBY(res, querySql, queryCheck, data);
};

const deleteData = (req, res) => {
    // buat variabel penampung data dan query sql
    const queryCheck = 'SELECT * FROM users WHERE id = ?';
    const querySql1 = 'DELETE FROM users WHERE id = ?';
    const querySql2 = 'DELETE FROM users_details WHERE id_profile = ?';
    
    // masukkan ke dalam model
    m_user.deleteUsers(res, querySql1, querySql2, queryCheck, req.params.id);
};

const verifikasi = (req, res) => {
    // buat variabel penampung data dan query sql
    // console.log(req.params)
    const queryCheck = 'SELECT * FROM users WHERE kodeOTP = ?';
    const querySql = 'UPDATE users SET ? WHERE kodeOTP = ?';
    
    // masukkan ke dalam model
    m_user.verifikasiUsers(res, querySql, queryCheck, req.params);
};

const updateKodePos = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT kode,nama,kode_pos FROM wilayah WHERE LEFT(kode,?)= ? AND CHAR_LENGTH(kode)= ? ORDER BY nama';
    const querySql = 'UPDATE wilayah SET ? WHERE kode = ?';
    
    // masukkan ke dalam model
    m_user.updateKodePos(res, querySql, queryCheck, data);
};

const readDataKabKotaOnly = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { kodeLength: '5' };
    const queryCheck = 'SELECT kode AS value,nama AS label FROM wilayah WHERE CHAR_LENGTH(kode)= ? ORDER BY nama';
    
    // masukkan ke dalam model
    m_user.getKabKotaOnly(res, queryCheck, data);
};

const readDataProvinsi = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { kodeLength: '2' };
    const queryCheck = 'SELECT kode AS value,nama AS label FROM wilayah WHERE CHAR_LENGTH(kode)= ? ORDER BY nama';
    
    // masukkan ke dalam model
    m_user.getProvinsi(res, queryCheck, data);
};

const readDataKabKota = (req, res) => {
    // buat variabel penampung data dan query sql
    const kode = req.params.id
    const jmlString = req.params.id.length
    const whereChar = (jmlString==2?5:(jmlString==5?8:13))
    const data = { kodeWilayah: kode, jmlString: jmlString, kodeLength: whereChar };
    const queryCheck = 'SELECT kode AS value,nama AS label FROM wilayah WHERE LEFT(kode,?)= ? AND CHAR_LENGTH(kode)= ? ORDER BY nama';
    
    // masukkan ke dalam model
    m_user.getKabKota(res, queryCheck, data);
};

const readDataKecamatan = (req, res) => {
    // buat variabel penampung data dan query sql
    const kode = req.params.id
    const jmlString = req.params.id.length
    const whereChar = (jmlString==2?5:(jmlString==5?8:13))
    const data = { kodeWilayah: kode, jmlString: jmlString, kodeLength: whereChar };
    const queryCheck = 'SELECT kode AS value,nama AS label FROM wilayah WHERE LEFT(kode,?)= ? AND CHAR_LENGTH(kode)= ? ORDER BY nama';
    
    // masukkan ke dalam model
    m_user.getKecamatan(res, queryCheck, data);
};

const readDataKelDesa = (req, res) => {
    // buat variabel penampung data dan query sql
    const kode = req.params.id
    const jmlString = req.params.id.length
    const whereChar = (jmlString==2?5:(jmlString==5?8:13))
    const data = { kodeWilayah: kode, jmlString: jmlString, kodeLength: whereChar };
    const queryCheck = 'SELECT kode AS value,nama AS label,kode_pos FROM wilayah WHERE LEFT(kode,?)= ? AND CHAR_LENGTH(kode)= ? ORDER BY nama';
    
    // masukkan ke dalam model
    m_user.getKelDesa(res, queryCheck, data);
};

const updateFile = (req, res) => {
    // buat variabel penampung data dan qursery sql
    const { body, files } = req;
    const dir=files[0];
    readXlsxFile(dir.path).then((rows) => {
        rows.shift();
        let jsonData = [];
        rows.forEach((row) => {
            let data = {
                nama: row[0],
                email: row[1],
                password: row[2],
            };
            jsonData.push(data);
        });
        console.log(jsonData)
    });
    // m_user.getKelDesa(res, queryCheck, data);
};

module.exports = {
    readData,
    createupdateData,
    updateDataBY,
    deleteData,
    verifikasi,
    updateKodePos,
    readDataKabKotaOnly,
    readDataProvinsi,
    readDataKabKota,
    readDataKecamatan,
    readDataKelDesa,
    updateFile,
}