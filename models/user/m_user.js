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

const getUsers = (res, statement, params) => {
    // jalankan query
	koneksi.query(statement, [params.idRole, params.idProfile], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        
        // jika request berhasil
        kode = 200
        message = 'Berhasil'
        response(res, { kode, message, data: result }, 200);
    });
};

const createupdateUsers = (res, statementCheck1, statementCheck2, Usersstatement, Usersdetailsstatement, data) => {
    // jalankan query
	switch(data.jenis) {
	case 'ADD' :
		koneksi.query(statementCheck1, [data.email, data.nomor_induk], async(err, result, field) => {
			// error handling
			if (err) {
				return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
			}
			if(result.length){
				if(!data.nomor_induk) return response(res, { kode: '404', message: 'Email sudah digunakan' }, 404);
				return response(res, { kode: '404', message: 'Nomor Induk atau Email sudah digunakan' }, 404);
			}else{
				// if (data.name == '' || data.name == null) { return response(res, { kode: '404', message: 'Nama Lengkap tidak boleh kosong', error: err }, 404); }
				// else if (data.password == '' || data.password == null) { return response(res, { kode: '404', message: 'Kata Sandi tidak boleh kosong', error: err }, 404); }
				const salt = await bcrypt.genSalt();
				const hashPassword = await bcrypt.hash(data.password, salt);
				const kirimdata1 = {
					roleID: data.roleID,
					name: data.name,
					email: data.email,
					password: hashPassword,
					kodeOTP: data.password,
				}
				koneksi.query(Usersstatement, kirimdata1, (err, result, field) => {
					// error handling
					if (err) {
						return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
					}
					koneksi.query(statementCheck2, data.email, async(err, result, field) => {
						// error handling
						if (err) {
							return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
						}
						const kirimdata2 = {
							id_profile: result[0].id,
							nomor_induk: data.roleID == '1' ? null : data.nomor_induk,
							nik_siswa: data.roleID == '3' ? data.nik_siswa : null,
							tempat: data.tempat,
							tgl_lahir: data.tgl_lahir,
							jeniskelamin: data.jeniskelamin,
							agama: data.agama,
							telp: data.telp,
							alamat: data.alamat,
							provinsi: data.provinsi,
							kabkota: data.kabkota,
							kecamatan: data.kecamatan,
							kelurahan: data.kelurahan,
							kode_pos: data.kode_pos,
							anakke: data.roleID == '3' ? data.anakke : null,
							jumlah_saudara: data.roleID == '3' ? data.jumlah_saudara : null,
							hobi: data.roleID == '3' ? data.hobi : null,
							cita_cita: data.roleID == '3' ? data.cita_cita : null,
							jenjang: data.roleID == '3' ? data.jenjang : null,
							status_sekolah: data.roleID == '3' ? data.status_sekolah : null,
							nama_sekolah: data.roleID == '3' ? data.nama_sekolah : null,
							npsn: data.roleID == '3' ? data.npsn : null,
							alamat_sekolah: data.roleID == '3' ? data.alamat_sekolah : null,
							kabkot_sekolah: data.roleID == '3' ? data.kabkot_sekolah : null,
							no_peserta_un: data.roleID == '3' ? data.no_peserta_un : null,
							no_skhun: data.roleID == '3' ? data.no_skhun : null,
							no_ijazah: data.roleID == '3' ? data.no_ijazah : null,
							nilai_un: data.roleID == '3' ? data.nilai_un : null,
							no_kk: data.roleID == '3' ? data.no_kk : null,
							nama_kk: data.roleID == '3' ? data.nama_kk : null,
							penghasilan: data.roleID == '3' ? data.penghasilan : null,
							nik_ayah: data.roleID == '3' ? data.nik_ayah : null,
							nama_ayah: data.roleID == '3' ? data.nama_ayah : null,
							tahun_ayah: data.roleID == '3' ? data.tahun_ayah : null,
							status_ayah: data.roleID == '3' ? data.status_ayah : null,
							pendidikan_ayah: data.roleID == '3' ? data.pendidikan_ayah : null,
							pekerjaan_ayah: data.roleID == '3' ? data.pekerjaan_ayah : null,
							telp_ayah: data.roleID == '3' ? data.telp_ayah : null,
							nik_ibu: data.roleID == '3' ? data.nik_ibu : null,
							nama_ibu: data.roleID == '3' ? data.nama_ibu : null,
							tahun_ibu: data.roleID == '3' ? data.tahun_ibu : null,
							status_ibu: data.roleID == '3' ? data.status_ibu : null,
							pendidikan_ibu: data.roleID == '3' ? data.pendidikan_ibu : null,
							pekerjaan_ibu: data.roleID == '3' ? data.pekerjaan_ibu : null,
							telp_ibu: data.roleID == '3' ? data.telp_ibu : null,
							nik_wali: data.roleID == '3' ? data.nik_wali : null,
							nama_wali: data.roleID == '3' ? data.nama_wali : null,
							tahun_wali: data.roleID == '3' ? data.tahun_wali : null,
							pendidikan_wali: data.roleID == '3' ? data.pendidikan_wali : null,
							pekerjaan_wali: data.roleID == '3' ? data.pekerjaan_wali : null,
							telp_wali: data.roleID == '3' ? data.telp_wali : null,
							status_tempat_tinggal: data.roleID == '3' ? data.status_tempat_tinggal : null,
							jarak_rumah: data.roleID == '3' ? data.jarak_rumah : null,
							transportasi: data.roleID == '3' ? data.transportasi : null,
						}
						// jika request berhasil
						koneksi.query(Usersdetailsstatement, kirimdata2, (err, result, field) => {
							// error handling
							if (err) {
								return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
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
								subject: 'Konfirmasi Pendaftaran Akun',
								// text: `Silahkan masukan kode verifikasi akun tersebut`
								html: `<h1>Konfirmasi Pendataran Akun</h1>
								<ul>
									<li>Nama Lengkap : ${data.name}</li>
									<li>Alamat Email : ${data.email}</li>
									<li>Kata Sandi : ${data.password}</li>
								</ul>
								Ikuti tautan ini untuk mengonfirmasi pendaftaran Anda:<br>
								<a href="http://localhost:5000/restApi/moduleUser/verifikasi/${data.password}/1">konfirmasi akun</a><br>Jika Anda memiliki pertanyaan, silakan balas email ini`
							};
	
							transporter.sendMail(mailOptions, (err, info) => {
								console.error(err)
								if (err) return response(res, { kode: '500', message: 'Gagal mengirim data ke alamat email anda, cek lagi email yang di daftarkan!.', error: err }, 500);;
								// jika request berhasil
								kode = 200
								message = 'Data berhasil disimpan'
								response(res, { kode, message }, 200);
							});
						});
					});
				});
			}
		});
		break;
	case 'EDIT':
		koneksi.query(statementCheck1, [data.email, data.nomor_induk], async(err, result, field) => {
			// error handling
			if (err) {
				return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
			}
			if(result.length){
				const salt = await bcrypt.genSalt();
				const hashPassword = await bcrypt.hash(data.kodeOTP, salt);
				const passbaru = data.password === result[0].password ? result[0].password : hashPassword
				const kondisipassbaru = data.password === result[0].password ? '<b>Menggunakan kata sandi yang lama</b>' : data.password
				const kodeverifikasi = data.password === result[0].password ? result[0].kodeOTP : data.kodeOTP
				const kirimdata1 = {
					name: data.name,
					email: data.email,
					password: passbaru,
					activeAkun: '0',
					kodeOTP: data.password === result[0].password ? result[0].kodeOTP : data.kodeOTP
				}
				koneksi.query(Usersstatement, [kirimdata1, data.id], (err, result, field) => {
					// error handling
					if (err) {
						return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
					}
					const kirimdata2 = {
						nomor_induk: data.roleID == '1' ? null : data.nomor_induk,
						nik_siswa: data.roleID == '3' ? data.nik_siswa : null,
						tempat: data.tempat,
						tgl_lahir: data.tgl_lahir,
						jeniskelamin: data.jeniskelamin,
						agama: data.agama,
						telp: data.telp,
						alamat: data.alamat,
						provinsi: data.provinsi,
						kabkota: data.kabkota,
						kecamatan: data.kecamatan,
						kelurahan: data.kelurahan,
						kode_pos: data.kode_pos,
						anakke: data.roleID == '3' ? data.anakke : null,
						jumlah_saudara: data.roleID == '3' ? data.jumlah_saudara : null,
						hobi: data.roleID == '3' ? data.hobi : null,
						cita_cita: data.roleID == '3' ? data.cita_cita : null,
						jenjang: data.roleID == '3' ? data.jenjang : null,
						status_sekolah: data.roleID == '3' ? data.status_sekolah : null,
						nama_sekolah: data.roleID == '3' ? data.nama_sekolah : null,
						npsn: data.roleID == '3' ? data.npsn : null,
						alamat_sekolah: data.roleID == '3' ? data.alamat_sekolah : null,
						kabkot_sekolah: data.roleID == '3' ? data.kabkot_sekolah : null,
						no_peserta_un: data.roleID == '3' ? data.no_peserta_un : null,
						no_skhun: data.roleID == '3' ? data.no_skhun : null,
						no_ijazah: data.roleID == '3' ? data.no_ijazah : null,
						nilai_un: data.roleID == '3' ? data.nilai_un : null,
						no_kk: data.roleID == '3' ? data.no_kk : null,
						nama_kk: data.roleID == '3' ? data.nama_kk : null,
						penghasilan: data.roleID == '3' ? data.penghasilan : null,
						nik_ayah: data.roleID == '3' ? data.nik_ayah : null,
						nama_ayah: data.roleID == '3' ? data.nama_ayah : null,
						tahun_ayah: data.roleID == '3' ? data.tahun_ayah : null,
						status_ayah: data.roleID == '3' ? data.status_ayah : null,
						pendidikan_ayah: data.roleID == '3' ? data.pendidikan_ayah : null,
						pekerjaan_ayah: data.roleID == '3' ? data.pekerjaan_ayah : null,
						telp_ayah: data.roleID == '3' ? data.telp_ayah : null,
						nik_ibu: data.roleID == '3' ? data.nik_ibu : null,
						nama_ibu: data.roleID == '3' ? data.nama_ibu : null,
						tahun_ibu: data.roleID == '3' ? data.tahun_ibu : null,
						status_ibu: data.roleID == '3' ? data.status_ibu : null,
						pendidikan_ibu: data.roleID == '3' ? data.pendidikan_ibu : null,
						pekerjaan_ibu: data.roleID == '3' ? data.pekerjaan_ibu : null,
						telp_ibu: data.roleID == '3' ? data.telp_ibu : null,
						nik_wali: data.roleID == '3' ? data.nik_wali : null,
						nama_wali: data.roleID == '3' ? data.nama_wali : null,
						tahun_wali: data.roleID == '3' ? data.tahun_wali : null,
						pendidikan_wali: data.roleID == '3' ? data.pendidikan_wali : null,
						pekerjaan_wali: data.roleID == '3' ? data.pekerjaan_wali : null,
						telp_wali: data.roleID == '3' ? data.telp_wali : null,
						status_tempat_tinggal: data.roleID == '3' ? data.status_tempat_tinggal : null,
						jarak_rumah: data.roleID == '3' ? data.jarak_rumah : null,
						transportasi: data.roleID == '3' ? data.transportasi : null,
					}
		
					// jika request berhasil
					koneksi.query(Usersdetailsstatement, [kirimdata2, data.id], (err, result, field) => {
						// error handling
						if (err) {
							return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
						}
		
						// jika request berhasil
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
							subject: 'Konfirmasi Pendaftaran Akun',
							// text: `Silahkan masukan kode verifikasi akun tersebut`
							html: `<h1>Konfirmasi Pendataran Akun</h1>
							<ul>
								<li>Nama Lengkap : ${data.name}</li>
								<li>Alamat Email : ${data.email}</li>
								<li>Kata Sandi : ${kondisipassbaru}</li>
							</ul>
							Ikuti tautan ini untuk mengonfirmasi pendaftaran Anda:<br>
							<a href="http://localhost:5000/restApi/moduleUser/verifikasi/${kodeverifikasi}/1">konfirmasi akun</a><br>Jika Anda memiliki pertanyaan, silakan balas email ini`
						};

						transporter.sendMail(mailOptions, (err, info) => {
							console.error(err)
							if (err) return response(res, { kode: '500', message: 'Gagal mengirim data ke alamat email anda, cek lagi email yang di daftarkan!.', error: err }, 500);;
							// jika request berhasil
							kode = 200
							message = 'Data berhasil diubah'
							response(res, { kode, message }, 200);
						});
					});
				});
			}
		})
		break;
	default:
		console.log('Error')
	}			
};

const updateUserBY = (res, statement, statementCheck, data) => {
    // jalankan query
	let kirimData;
    koneksi.query(statementCheck, data.id, async(err, result, field) => {
        // error handling
		let pesan = ''
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
			switch(data.jenis) {
				case 'activeAkun' :
						kirimData = {
							activeAkun: data.activeAkun
						}
						pesan = data.activeAkun === '0' ? 'Berhasil mengubah aktif akun menjadi tidak aktif' : 'Berhasil mengubah aktif akun menjadi aktif'
					break;
				default:
					console.log('Error')
			}
			koneksi.query(statement, [kirimData, data.id], (err, result, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
                }

                // jika request berhasil
                kode = 200
                message = pesan
                response(res, { kode, message }, 200);
            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
        }
    });
};

const deleteUsers = (res, statement1, statement2, statementCheck, id) => {
    // jalankan query
    koneksi.query(statementCheck, id, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
            koneksi.query(statement1, id, (err, result, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
                }

                // jika request berhasil
                koneksi.query(statement2, id, (err, result, field) => {
					// error handling
					if (err) {
						return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
					}
	
					// jika request berhasil
					kode = 200
					message = 'Berhasil'
					response(res, { kode, message }, 200);
				});
            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
        }
    });
};

const verifikasiUsers = (res, statement, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.kode, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
			const kirimData = {
				gambarGmail : null,
				refresh_token : null,
				codeLog : '0',
				activeAkun : data.activeAkun
			}
            koneksi.query(statement, [kirimData, data.kode], (err, result, field) => {
                // error handling
                if (err) {
                    return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
                }
			
				res.send("<script>window.close();</script > ")

            });
        }else{
            return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
        }
    });
};

const updateKodePos = (res, statement, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.kode1, data.cari, data.jmlkode], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
			result.forEach(element => {
				// console.log(element.kode)
				const kirimData = {
					kode_pos : data.kode_pos,
				}
				koneksi.query(statement, [kirimData, element.kode], (err, result, field) => {
				    // error handling
				    if (err) {
				        return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
				    }			
				});
			});
			kode = 200
			message = 'Berhasil'
			response(res, { kode, message }, 200);
        }else{
            return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
        }
    });
};

const getKabKotaOnly = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.kodeLength, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const getProvinsi = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.kodeLength, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const getKabKota = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.jmlString, data.kodeWilayah, data.kodeLength], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const getKecamatan = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.jmlString, data.kodeWilayah, data.kodeLength], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const getKelDesa = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.jmlString, data.kodeWilayah, data.kodeLength], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

module.exports = {
    getUsers,
    createupdateUsers,
    updateUserBY,
    deleteUsers,
    verifikasiUsers,
    updateKodePos,
    getKabKotaOnly,
    getProvinsi,
    getKabKota,
    getKecamatan,
    getKelDesa,
}