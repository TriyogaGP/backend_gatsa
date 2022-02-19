const { m_user } = require('../../models');
const readXlsxFile = require('read-excel-file/node');

error = {}

function convertDate(str) {
	let date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  	const valueConvert = [date.getFullYear(), mnth, day].join("-");
	return valueConvert
}

const dataDashboard = (req, res) => {
    // buat query sql
    const querySql = `SELECT a.*, b.* FROM users AS a INNER JOIN users_details AS b ON a.id = b.id_profile WHERE a.roleID != 1`;

    // masukkan ke dalam model
    m_user.dataDashboard(res, querySql);
};

const readData = (req, res) => {
    // buat query sql
    const querySql = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, a.validasiAkun, a.mutationAkun,
    DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
    c.*, d.nama as nama_provinsi, e.nama as nama_kabkota, f.nama as nama_kecamatan, g.nama as nama_kelurahan, h.nama as nama_kabkot_sekolah, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
    INNER JOIN roleusers AS b ON a.roleID=b.id 
    INNER JOIN users_details AS c ON a.id=c.id_profile
    INNER JOIN wilayah AS d ON c.provinsi=d.kode
    INNER JOIN wilayah AS e ON c.kabkota=e.kode
    INNER JOIN wilayah AS f ON c.kecamatan=f.kode
    INNER JOIN wilayah AS g ON c.kelurahan=g.kode
    INNER JOIN wilayah AS h ON c.kabkota=h.kode
    WHERE a.roleID = ? && a.id != ? ORDER BY item_no asc`;
    
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
    const queryCheck = 'SELECT kode FROM db_gatsa_web.wilayah WHERE LEFT(kode,5)= ? AND CHAR_LENGTH(kode)= 8 ORDER BY kode';
    const queryCheck2 = 'SELECT kode FROM wilayah WHERE LEFT(kode,8)= ? AND CHAR_LENGTH(kode)= 13 ORDER BY kode';
    const querySql = 'UPDATE wilayah SET ? WHERE kode = ?';
    
    // masukkan ke dalam model
    m_user.updateKodePos(res, querySql, queryCheck, queryCheck2, data);
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
    let jsonData = [];
    readXlsxFile(dir.path).then((rows) => {
        rows.shift();
        rows.forEach((row) => {
            let data = {
                name: row[0], 
                email: row[1], 
                nik_siswa: row[2], 
                nomor_induk: row[3], 
                tgl_lahir: convertDate(row[4]),
                tempat: row[5], 
                jeniskelamin: row[6], 
                agama: row[7], 
                anakke: row[8], 
                jumlah_saudara: row[9], 
                hobi: row[10], 
                cita_cita: row[11], 
                jenjang: row[12], 
                nama_sekolah: row[13], 
                status_sekolah: row[14], 
                npsn: row[15], 
                alamat_sekolah: row[16], 
                kabkot_sekolah: row[17], 
                no_kk: row[18], 
                nama_kk: row[19], 
                nik_ayah: row[20], 
                nama_ayah: row[21], 
                tahun_ayah: row[22], 
                status_ayah: row[23], 
                pendidikan_ayah: row[24], 
                pekerjaan_ayah: row[25], 
                telp_ayah: row[26], 
                nik_ibu: row[27], 
                nama_ibu: row[28], 
                tahun_ibu: row[29], 
                status_ibu: row[30], 
                pendidikan_ibu: row[31], 
                pekerjaan_ibu: row[32], 
                telp_ibu: row[33], 
                telp: row[34], 
                alamat: row[35], 
                provinsi: row[36], 
                kabkota: row[37], 
                kecamatan: row[38], 
                kelurahan: row[39], 
                kode_pos: row[40],
                penghasilan: row[41],
            };
            jsonData.push(data);
        });
        // console.log(jsonData)
        const queryCheck = 'SELECT * FROM users WHERE email = ?';
        const querySqlUsers = 'INSERT INTO users SET ?';
        const querySqlUsersDetails = 'INSERT INTO users_details SET ?';
        
        // // masukkan ke dalam model
        m_user.importData(res, queryCheck, querySqlUsers, querySqlUsersDetails, jsonData);
    });
};

const downloadexcel = (req, res) => {
    // buat variabel penampung data dan qursery sql
    m_user.downloadexcel(res, req.params.roleid);
};

const updateBerkas = (req, res) => {
    // buat variabel penampung data dan qursery sql
    const { body, files } = req;
    const namaFile = files[0].filename;
    const data = { ...body, namaFile };
    const queryCheck = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, a.validasiAkun, a.mutationAkun,
    DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
    c.*, d.nama as nama_provinsi, e.nama as nama_kabkota, f.nama as nama_kecamatan, g.nama as nama_kelurahan, h.nama as nama_kabkot_sekolah, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
    INNER JOIN roleusers AS b ON a.roleID=b.id 
    INNER JOIN users_details AS c ON a.id=c.id_profile
    INNER JOIN wilayah AS d ON c.provinsi=d.kode
    INNER JOIN wilayah AS e ON c.kabkota=e.kode
    INNER JOIN wilayah AS f ON c.kecamatan=f.kode
    INNER JOIN wilayah AS g ON c.kelurahan=g.kode
    INNER JOIN wilayah AS h ON c.kabkota=h.kode
    WHERE a.id = ?`;
    const querySqlUpdate = 'UPDATE users_details SET ? WHERE id_profile = ?';
    m_user.updateBerkas(res, queryCheck, querySqlUpdate, data);
};

const exportexcel = (req, res) => {
    // buat variabel penampung data dan qursery sql
    const querySelect = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, a.validasiAkun, a.mutationAkun, 
    DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
    c.*, d.nama as nama_provinsi, e.nama as nama_kabkota, f.nama as nama_kecamatan, g.nama as nama_kelurahan, h.nama as nama_kabkot_sekolah, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
    INNER JOIN roleusers AS b ON a.roleID=b.id 
    INNER JOIN users_details AS c ON a.id=c.id_profile
    INNER JOIN wilayah AS d ON c.provinsi=d.kode
    INNER JOIN wilayah AS e ON c.kabkota=e.kode
    INNER JOIN wilayah AS f ON c.kecamatan=f.kode
    INNER JOIN wilayah AS g ON c.kelurahan=g.kode
    INNER JOIN wilayah AS h ON c.kabkota=h.kode
    WHERE a.roleID = ? OR c.kelas = ? ORDER BY item_no asc`;

    m_user.exportexcel(res, querySelect, req.params.cari, req.query);
}

const getkelas = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.query };
    const queryCheck = data.kelas === "ALL" ? `SELECT CONCAT_WS('-', kelas, number) as value, CONCAT_WS('-', kelas, number) as label FROM kelas WHERE activeKelas = 1 ORDER BY id_kelas`
                        : `SELECT CONCAT_WS('-', kelas, number) as value, CONCAT_WS('-', kelas, number) as label FROM kelas WHERE kelas = ? && activeKelas = 1 ORDER BY id_kelas`;
    
    // masukkan ke dalam model
    m_user.getKelas(res, queryCheck, data);
};

const ambilKelas = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, a.validasiAkun, a.mutationAkun, 
    DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
    c.*, d.nama as nama_provinsi, e.nama as nama_kabkota, f.nama as nama_kecamatan, g.nama as nama_kelurahan, h.nama as nama_kabkot_sekolah, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
    INNER JOIN roleusers AS b ON a.roleID=b.id 
    INNER JOIN users_details AS c ON a.id=c.id_profile
    INNER JOIN wilayah AS d ON c.provinsi=d.kode
    INNER JOIN wilayah AS e ON c.kabkota=e.kode
    INNER JOIN wilayah AS f ON c.kecamatan=f.kode
    INNER JOIN wilayah AS g ON c.kelurahan=g.kode
    INNER JOIN wilayah AS h ON c.kabkota=h.kode
    WHERE a.id = ?`;
    const querySqlUsersDetails = 'UPDATE users_details SET ? WHERE id_profile = ?';
    
    // // masukkan ke dalam model
    m_user.ambilKelas(res, queryCheck, querySqlUsersDetails, data);
};

const detailUserPDF = (req, res) => {
    // buat variabel penampung data dan query sql
    const queryCheck = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, a.validasiAkun, a.mutationAkun, 
    DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
    c.*, d.nama as nama_provinsi, e.nama as nama_kabkota, f.nama as nama_kecamatan, g.nama as nama_kelurahan, h.nama as nama_kabkot_sekolah, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
    INNER JOIN roleusers AS b ON a.roleID=b.id 
    INNER JOIN users_details AS c ON a.id=c.id_profile
    INNER JOIN wilayah AS d ON c.provinsi=d.kode
    INNER JOIN wilayah AS e ON c.kabkota=e.kode
    INNER JOIN wilayah AS f ON c.kecamatan=f.kode
    INNER JOIN wilayah AS g ON c.kelurahan=g.kode
    INNER JOIN wilayah AS h ON c.kabkota=h.kode
    WHERE a.id = ?`;
    
    // // masukkan ke dalam model
    m_user.detailUserPDF(res, queryCheck, req.params.id);
};

const kelasSiswa = (req, res) => {
    // buat variabel penampung data dan query sql
    const querySql = `SELECT a.id, a.roleID, a.name, a.email, a.password, a.gambar, a.gambarGmail, a.codeLog, a.kodeOTP, a.activeAkun, a.validasiAkun, a.mutationAkun,
    DATE_FORMAT(a.createdAt,'%Y-%m-%d') AS createdAt, DATE_FORMAT(a.updatedAt,'%Y-%m-%d') AS updatedAt, b.roleName, 
    c.*, d.nama as nama_provinsi, e.nama as nama_kabkota, f.nama as nama_kecamatan, g.nama as nama_kelurahan, h.nama as nama_kabkot_sekolah, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a 
    INNER JOIN roleusers AS b ON a.roleID=b.id 
    INNER JOIN users_details AS c ON a.id=c.id_profile
    INNER JOIN wilayah AS d ON c.provinsi=d.kode
    INNER JOIN wilayah AS e ON c.kabkota=e.kode
    INNER JOIN wilayah AS f ON c.kecamatan=f.kode
    INNER JOIN wilayah AS g ON c.kelurahan=g.kode
    INNER JOIN wilayah AS h ON c.kabkota=h.kode
    WHERE a.activeAkun = 1 && a.mutationAkun = 0 && c.kelas = ? ORDER BY item_no asc`;

    // masukkan ke dalam model
    m_user.kelasSiswa(res, querySql, req.params.kelas);
};

module.exports = {
    dataDashboard,
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
    updateBerkas,
    downloadexcel,
    exportexcel,
    getkelas,
    ambilKelas,
    detailUserPDF,
    kelasSiswa,
}