const { m_login } = require('../../models');

error = {}

const readData = (req, res) => {
    // buat query sql
    const querySql = `SELECT a.*, b.roleName, ROW_NUMBER() OVER(ORDER BY a.id ASC) AS item_no FROM users AS a INNER JOIN roleUsers AS b ON a.roleID=b.id WHERE a.roleID = ? ORDER BY item_no ASC`;
    
    // masukkan ke dalam model
    m_login.getUsers(res, querySql, req.params.idRole);
};

const readDataByID = (req, res) => {
    // buat query sql
    const querySql = 'SELECT a.*, b.*, c.roleName FROM users AS a INNER JOIN users_details AS b ON a.id=b.id_profile INNER JOIN roleUsers AS c ON a.roleID=c.id WHERE a.id = ?';
    
    // masukkan ke dalam model
    m_login.getUsersBy(res, querySql, req.params.id);
};

const readDataByIDLock = (req, res) => {
    // buat query sql
    const querySql = 'SELECT a.*,b.roleName FROM users AS a INNER JOIN roleUsers AS b ON a.roleID=b.id WHERE a.id = ?';
    
    // masukkan ke dalam model
    m_login.getUsersBy(res, querySql, req.params.id);
};

const register = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT * FROM users WHERE name = ? OR email = ?';
    const querySql = 'INSERT INTO users SET ?';

    // masukkan ke dalam model
    m_login.createUsers(res, querySql, queryCheck, data);
};

const confirmation = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO users SET ?';

    // masukkan ke dalam model
    m_login.confirmationUsers(res, querySql, data);
};

const login = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT a.*, b.nomor_induk FROM users AS a INNER JOIN users_details AS b ON a.id=b.id_profile WHERE (a.email = ? OR b.nomor_induk = ?) && a.activeAkun = 1';
    const querySql = 'UPDATE users SET ? WHERE email = ?';

    // masukkan ke dalam model
    m_login.loginUsers(res, querySql, queryCheck, data);
};

const loginByGmail = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT * FROM users WHERE email = ? && activeAkun = 1';
    const querySql = 'UPDATE users SET ? WHERE email = ?';

    // masukkan ke dalam model
    m_login.loginUsersByGmail(res, querySql, queryCheck, data);
};

const postImage = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'UPDATE users SET ? WHERE email = ?';
    
    // masukkan ke dalam model
    m_login.postUsersByGmail(res, querySql, data);
};

const updateImage = (req, res) => {
    // buat variabel penampung data dan query sql
    const namaFile = req.files[0].filename;
    const data = { ...req.body, namaFile };
    const querySql = 'UPDATE users SET ? WHERE id = ?';
    
    // masukkan ke dalam model
    m_login.postImageUser(res, querySql, data);
};

const refreshToken = (req, res) => {
    // buat variabel penampung data dan query sql
    const queryCheck = 'SELECT * FROM users WHERE id = ?';

    // masukkan ke dalam model
    m_login.refreshtoken(res, queryCheck, req.params.id);
};

const updateData = (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const queryCheck = 'SELECT * FROM users WHERE id = ?';
    const querySql = 'UPDATE users SET ? WHERE id = ?';
    
    // masukkan ke dalam model
    m_login.updateUser(res, querySql, queryCheck, data);
};

const logout = (req, res) => {
    // buat variabel penampung data dan query sql
    const queryCheck = 'SELECT * FROM users WHERE id = ?';
    const querySql = 'UPDATE users SET ? WHERE email = ?';
    // masukkan ke dalam model
    m_login.logoutUsers(res, querySql, queryCheck, req.params.id);
};

module.exports = {
    readData,
    readDataByID,
    readDataByIDLock,
    register,
    confirmation,
    login,
    refreshToken,
    loginByGmail,
    postImage,
    updateImage,
    updateData,
    logout,
}