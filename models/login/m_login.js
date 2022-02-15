const koneksi = require('../../config/db');
const { response } = require('../../config');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

function makeRandom(n) {
	for (let r = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", 
				"o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F",
				 "G", "H", "I",  "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W",
				 "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], e = n, t = new Array, a = 0; a <= e - 1; a++) {
		t[a] = r[parseInt(Math.random() * r.length)];
		t = t;
		randomtextnumber = t.join("")
	}
}

const getUsers = (res, statement, idRole) => {
    // jalankan query
    koneksi.query(statement, idRole, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        
        // jika request berhasil
        kode = 200
        message = 'Berhasil'
        response(res, { kode, message, data: result }, 200);
    });
};

const getUsersBy = (res, statement, id) => {
    // jalankan query
    koneksi.query(statement, id, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }

        // jika request berhasil
        kode = 200
        message = 'Berhasil'
        response(res, { kode, message, data: result[0] }, 200);
    });
};

const createUsers = (res, statement, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.name, data.email], async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        if(result.length){
            return response(res, { kode: '404', message: 'Nama atau Email sudah digunakan' }, 404);
        }else{
            if (data.name == '' || data.name == null) { return response(res, { kode: '404', message: 'Nama Lengkap tidak boleh kosong', error: err }, 404); }
            else if (data.password == '' || data.password == null) { return response(res, { kode: '404', message: 'Kata Sandi tidak boleh kosong', error: err }, 404); }
            else if (data.confPassword == '' || data.confPassword == null) { return response(res, { kode: '404', message: 'Konfirmasi Kata Sandi tidak boleh kosong', error: err }, 404); }
            else if(data.password !== data.confPassword) return response(res, { kode: '404', message: 'Kata Sandi dan Konfirmasi Kata Sandi tidak cocok !' }, 404);
            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(data.password, salt);
			const randomOTP = (makeRandom(8), randomtextnumber)
            const kirimData = {
                name: data.name,
                email: data.email,
                password: hashPassword,
                kodeOTP: randomOTP,
                roleID: data.role === "Admin" ? '1' : data.role === "Operator" ? '2' : '3'
            }
            
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'triyoga.ginanjar.p@gmail.com',
					pass: 'Yoga17051993'
				}
			});

			var mailOptions = {
				from: 'triyoga.ginanjar.p@gmail.com',
				to: data.email,
				subject: 'Verifikasi pendaftaran akun',
				text: `Silahkan masukan kode verifikasi akun tersebut ${randomOTP}`
			};
			
			transporter.sendMail(mailOptions, (err, info) => {
				if (err) return response(res, { kode: '500', message: 'Gagal mengirim verifikasi pendaftaran akun, cek lagi email yang di daftarkan.', error: err }, 500);;
				kode = 200
				message = 'Kode Verifikasi sudah di kirim ke alamat email anda silahkan periksa alamat email anda untuk mendapatkan Kode Verifikasi tersebut'
				response(res, { kode, message, data: kirimData }, 200);
			});
        }
    });
};

const confirmationUsers = (res, statement, data) => {
    // jalankan query
	const kirimData = {
		name: data.name,
		email: data.email,
		password: data.password,
		kodeOTP: data.kodeOTP,
		roleID: data.roleID
	}
	koneksi.query(statement, kirimData, (err, result, field) => {
		// error handling
		if (err) {
			return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
		}
		
		// jika request berhasil
		kode = 200
		message = 'Akun anda berhasil di daftakan!'
		response(res, { kode, message }, 200);
	});
};

const loginUsers = (res, statement, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.username, data.username], async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        if(result.length){
            const match = await bcrypt.compare(data.password, result[0].password);
            if(!match) return response(res, { kode: '404', message: 'Kata Sandi salah !' }, 404);
            const userID = result[0].id;
            const name = result[0].name;
            const email = result[0].email;
            const accessToken = jwt.sign({userID, name, email}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '12h'
            });
            const refreshToken = jwt.sign({userID, name, email}, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            
            const kirimData ={
                refresh_token: refreshToken,
                codeLog: '1',
                gambarGmail: null
            }

            koneksi.query(statement, [kirimData, email], (err, resultt, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
                }

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    // secure: true
                });

                // jika request berhasil
                kode = 200
                message = 'Anda berhasil masuk panel Dashboard!'
                response(res, { kode, message, data: {...result, access_token: accessToken} }, 200);
            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak di temukan !' }, 404);
        }
    });
};

const loginUsersByGmail = (res, statement, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.email, async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        if(result.length){
            const userID = result[0].id;
            const name = result[0].name;
            const email = result[0].email;
            const accessToken = jwt.sign({userID, name, email}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '12h'
            });
            const refreshToken = jwt.sign({userID, name, email}, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            
            const kirimData ={
                refresh_token: refreshToken
            }

            koneksi.query(statement, [kirimData, data.email], (err, resultt, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
                }

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    // secure: true
                });

                // jika request berhasil
                kode = 200
                message = 'Anda berhasil masuk panel Dashboard!'
                response(res, { kode, message, data: {...result, access_token: accessToken} }, 200);
            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak di temukan, Email anda tidak terdaftar !' }, 404);
        }
    });
};

const postUsersByGmail = (res, statement, data) => {
    // jalankan query
    const kirimData ={
        gambarGmail: data.gambar,
        codeLog: '2'
    }
    koneksi.query(statement, [kirimData, data.email], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }

        // jika request berhasil
        kode = 200
        message = 'Anda berhasil masuk panel Dashboard!'
        response(res, { kode, message }, 200);
    });
};

const refreshtoken = (res, statementCheck, id) => {
    // jalankan query
    koneksi.query(statementCheck, id, async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        if(result.length){
            const refreshToken = result[0].refresh_token;
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if(err) return response(res, { kode: '404', message: 'Tidak bisa akses halaman ini !' }, 404);
                const userID = result[0].id;
                const name = result[0].name;
                const email = result[0].email;
                const accessToken = jwt.sign({userID, name, email}, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '10h'
                });
                kode = 200
                message = 'Berhasil'
                response(res, { kode, message, access_token: accessToken }, 200);
            });    
        }else{
            return response(res, { kode: '404', message: 'Data tidak di temukan !' }, 404);
        }
    });
};

const postImageUser = (res, statementCheck, data) => {
    // jalankan query
    const kirimData = {
        gambar: data.namaFile
    }
    koneksi.query(statementCheck, [kirimData, data.id], async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        kode = 200
        message = 'Berhasil'
        response(res, { kode, message }, 200);
    });
};

const updateUser = (res, statement, statement2, statementCheck, data) => {
    // jalankan query
	let kirimData;
    koneksi.query(statementCheck, data.id, async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        if(result.length){
            if(data.ubah === 'nama'){
                kirimData = {
                    name: data.name
                }
            }else if(data.ubah === 'katasandi'){
                // console.log(data.passwordlama, result[0].password)
                if (data.passwordlama == '' || data.passwordlama == null) { return response(res, { kode: '404', message: 'Kata Sandi Lama tidak boleh kosong', error: err }, 404); }
                const match = await bcrypt.compare(data.passwordlama, result[0].password);
                if(!match) return response(res, { kode: '404', message: 'Kata Sandi Lama salah !' }, 404);
                if (data.passwordbaru == '' || data.passwordbaru == null) { return response(res, { kode: '404', message: 'Kata Sandi Baru tidak boleh kosong', error: err }, 404); }
                else if (data.confPasswordbaru == '' || data.confPasswordbaru == null) { return response(res, { kode: '404', message: 'Konfirmasi Kata Sandi Baru tidak boleh kosong', error: err }, 404); }
                else if(data.passwordbaru !== data.confPasswordbaru) return response(res, { kode: '404', message: 'Kata Sandi dan Konfirmasi Kata Sandi tidak cocok !' }, 404);
                const salt = await bcrypt.genSalt();
                const hashPassword = await bcrypt.hash(data.passwordbaru, salt);

                const userID = result[0].id;
                const name = result[0].name;
                const email = result[0].email;
                const codeLog = result[0].codeLog;
                const accessToken = jwt.sign({userID, name, email}, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '12h'
                });
                const refreshToken = jwt.sign({userID, name, email}, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: '1d'
                });

                kirimData = {
                    password: hashPassword,
                    refresh_token: refreshToken,
                    codeLog: codeLog,
                    gambarGmail: null,
                    kodeOTP: data.passwordbaru
                }
            }else if(data.ubah === 'datapribadi'){
                kirimData = {
                    email: data.email
                }

                const kirimData2 = {
                    telp: data.telp,
                    alamat: data.alamat,
                    provinsi: data.provinsi,
                    kabkota: data.kabkota,
                    kecamatan: data.kecamatan,
                    kelurahan: data.kelurahan,
                    kode_pos: data.kode_pos,
                }
                koneksi.query(statement2, [kirimData2, data.id], (err, result, field) => {
                    // error handling
                    if (err) {
                        return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
                    }
                });
            }
            koneksi.query(statement, [kirimData, data.id], (err, result, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
                }

                // jika request berhasil
                kode = 200
                message = 'Berhasil'
                response(res, { kode, message }, 200);
            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
        }
    });
};

const logoutUsers = (res, statement, statementCheck, id) => {
    // jalankan query
    koneksi.query(statementCheck, id, async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
        }
        if(result.length){
            const email = result[0].email;

            const kirimData ={
                refresh_token: null,
                codeLog: '0',
                gambarGmail: null
            }

            koneksi.query(statement, [kirimData, email], (err, result, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
                }

                res.clearCookie('refreshToken');

                // jika request berhasil
                kode = 200
                message = 'Berhasil'
                response(res, { kode, message }, 200);
            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak di temukan !' }, 404);
        }
    });
};

module.exports = {
    getUsers,
    getUsersBy,
    createUsers,
    confirmationUsers,
    loginUsers,
    loginUsersByGmail,
    postImageUser,
    refreshtoken,
    postUsersByGmail,
    updateUser,
    logoutUsers
}