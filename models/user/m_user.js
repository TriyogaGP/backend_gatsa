const koneksi = require('../../config/db');
const { response } = require('../../config');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const excel = require("exceljs");
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const dotenv = require('dotenv');
const { exit } = require('process');
dotenv.config();

function makeRandom(n) {
	let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < n; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   	}
   	return result;
}

function UpperFirstLetter(str) {
	return str.split(' ').map(i => i[0].toUpperCase() + i.substring(1).toLowerCase()).join(' ')
}

function dateconvert(str) {
	const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
	const date = new Date(str);
    const mnth = bulan[date.getMonth()];
    const day = ("0" + date.getDate()).slice(-2);
  	const valueConvert = [day, mnth, date.getFullYear()].join(" ")
	return valueConvert
}

const dataDashboard = (res, statement, data) => {
    // jalankan query
	koneksi.query(statement, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		//Untuk Administrator
		let dataDashboard
		if(data.kode == 'admin') {
			let dataSiswaPria = result.filter((el) => el.roleID === 3 && el.activeAkun === 1 && el.mutationAkun === 0 && el.jeniskelamin === "Laki - Laki").length
			let dataSiswaWanita = result.filter((el) => el.roleID === 3 && el.activeAkun === 1 && el.mutationAkun === 0 && el.jeniskelamin === "Perempuan").length
			let dataSiswaMutasi = result.filter((el) => el.roleID === 3 && (el.activeAkun === 1 || el.activeAkun === 0) && el.mutationAkun === 1).length
			let dataGuru = result.filter((el) => el.roleID === 2 && el.activeAkun === 1).length
			// console.log(dataSiswaPria, dataSiswaWanita, dataSiswaMutasi, dataGuru)
			dataDashboard = {
				dataSiswaPria: dataSiswaPria,
				dataSiswaWanita: dataSiswaWanita,
				dataSiswaMutasi: dataSiswaMutasi,
				dataGuru: dataGuru
			}
		} else if(data.kode == 'guru') {
			//Untuk Guru Perseorangan
			let mencariGuru = result.filter((el) => el.id_profile === parseInt(data.id_profile))
			console.log(mencariGuru)
			const mengajarKelas = String(mencariGuru[0].mengajar_kelas)
			let MengajarKelas = mengajarKelas.split(', ').sort()
			let jumlahSiswa
			let hasilPush = new Array()
			MengajarKelas.map((kelas) => {
				jumlahSiswa = result.filter((el) => el.roleID === 3 && el.activeAkun === 1 && el.mutationAkun === 0 && el.kelas === kelas).length
				hasilPush.push({kelas, jumlahSiswa})
			})
			dataDashboard = {
				dataGuru: mencariGuru[0],
				total: hasilPush
			}
		} else if(data.kode == 'siswa') {
			dataDashboard = null
		}
        // jika request berhasil
        kode = 200
        message = 'Berhasil'
        response(res, { kode, message, totalData: dataDashboard }, 200);
    });
};

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
							pendidikan_guru: data.roleID === '2' ? data.pendidikan_guru : null,
							jabatan_guru: data.roleID === '2' ? data.jabatan_guru : null,
							mengajar_bidang: data.roleID === '2' ? data.mengajar_bidang : null,
							mengajar_kelas: data.roleID === '2' ? data.mengajar_kelas : null,
							walikelas: data.roleID === '2' ? data.walikelas : null,
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
								from: process.env.EMAIL,
								to: data.email,
								subject: 'Konfirmasi Pendaftaran Akun',
								// text: `Silahkan masukan kode verifikasi akun tersebut`
								html: `<h1>Konfirmasi Pendataran Akun</h1>
								<ul>
									${data.roleID !== 1 && `<li>Nomor Induk ${data.roleID === 2 ? 'Pegawai' : 'Siswa' } : ${data.nomor_induk}</li>`}
									<li>Nama Lengkap : ${data.name}</li>
									<li>Alamat Email : ${data.email}</li>
									<li>Kata Sandi : ${data.password}</li>
								</ul>
								Harap informasi ini jangan di hapus karena informasi ini penting adanya, dan klik tautan ini untuk mengonfirmasi pendaftaran Anda:<br>
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
						pendidikan_guru: data.roleID === '2' ? data.pendidikan_guru : null,
						jabatan_guru: data.roleID === '2' ? data.jabatan_guru : null,
						mengajar_bidang: data.roleID === '2' ? data.mengajar_bidang : null,
						mengajar_kelas: data.roleID === '2' ? data.mengajar_kelas : null,
						walikelas: data.roleID === '2' ? data.walikelas : null,
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
							from: process.env.EMAIL,
							to: data.email,
							subject: 'Konfirmasi Pendaftaran Akun',
							// text: `Silahkan masukan kode verifikasi akun tersebut`
							html: `<h1>Konfirmasi Pendataran Akun</h1>
							<ul>
								${data.roleID !== 1 && `<li>Nomor Induk ${data.roleID === '2' ? 'Pegawai' : 'Siswa' } : ${data.nomor_induk}</li>`}
								<li>Nama Lengkap : ${data.name}</li>
								<li>Alamat Email : ${data.email}</li>
								<li>Kata Sandi : ${kondisipassbaru}</li>
							</ul>
							Harap informasi ini jangan di hapus karena informasi ini penting adanya, dan klik tautan ini untuk mengonfirmasi pendaftaran Anda:<br>
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
			if(data.table === 'users') {
				switch(data.jenis) {
					case 'activeAkun' :
							kirimData = {
								activeAkun: data.activeAkun
							}
							pesan = data.activeAkun === '0' ? 'Berhasil mengubah aktif Akun menjadi tidak aktif' : 'Berhasil mengubah aktif Akun menjadi aktif'
						break;
					case 'validasiAkun' :
							kirimData = {
								validasiAkun: data.validasiAkun
							}
							pesan = data.validasiAkun === '0' ? 'Berhasil mengubah data Akun menjadi tidak tervalidasi' : 'Berhasil mengubah data Akun menjadi tervalidasi'
						break;
					case 'mutationAkun' :
							kirimData = {
								activeAkun: data.activeAkun,
								mutationAkun: data.mutationAkun
							}
							pesan = data.mutationAkun === '0' ? 'Berhasil mengubah data Akun menjadi tidak di mutasi' : 'Berhasil mengubah data Akun menjadi di mutasi'
						break;
					default:
						console.log('Error')
				}
			}else{
				kirimData = {
					status: data.activeStatus
				}
				pesan = data.activeStatus === '0' ? 'Berhasil mengubah aktif Jadwal Mengajar menjadi tidak aktif' : 'Berhasil mengubah aktif Jadwal Mengajar menjadi aktif'
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

const updateKodePos = (res, statement, statementCheck, statementCheck2, data) => {
    // jalankan query
    // koneksi.query(statementCheck, [data.kode1, data.cari, data.jmlkode], (err, result, field) => {
    //     // error handling
    //     if (err) {
    //         return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
    //     }
    //     if(result.length){
	// 		result.forEach(element => {
	// 			// console.log(element.kode)
	// 			const kirimData = {
	// 				kode_pos : data.kode_pos,
	// 			}
	// 			koneksi.query(statement, [kirimData, element.kode], (err, result, field) => {
	// 			    // error handling
	// 			    if (err) {
	// 			        return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
	// 			    }			
	// 			});
	// 		});
	// 		kode = 200
	// 		message = 'Berhasil'
	// 		response(res, { kode, message }, 200);
    //     }else{
    //         return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
    //     }
    // });
    koneksi.query(statementCheck, data.cari, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
			for (let i = 0; i < result.length; i++) {
				const kirimData = {
					kode_pos : data.kode_pos[i],
				}
				koneksi.query(statementCheck2, result[i].kode, (err, result2, field) => {
					// error handling
					if (err) {
						return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
					}
					result2.forEach(element => {
						koneksi.query(statement, [kirimData, element.kode], (err, result, field) => {
							// error handling
							if (err) {
								return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
							}			
						});
					});
				});
			}
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

const updateBerkas = (res, statementCheck, Update, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.id, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		let kirimData
		if(data.namaBerkas === 'ijazah'){
			kirimData = {fc_ijazah: data.namaFile}
		}else if(data.namaBerkas === 'kk'){
			kirimData = {fc_kk: data.namaFile}
		}else if(data.namaBerkas === 'ktp'){
			kirimData = {fc_ktp_ortu: data.namaFile}
		}else if(data.namaBerkas === 'aktalahir'){
			kirimData = {fc_akta_lahir: data.namaFile}
		}else if(data.namaBerkas === 'skl'){
			kirimData = {fc_skl: data.namaFile}
		}
		koneksi.query(Update, [kirimData, data.id], (err, result, field) => {
			// error handling
			if (err) {
				return response(res, { kode: '500', message: 'Gagal', error: err }, 500);
			}
			koneksi.query(statementCheck, data.id, (err, result, field) => {
				// error handling
				if (err) {
					return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
				}
				kode = 200
				message = 'Berhasil'
				response(res, { kode, message, data: result[0] }, 200);
			});
		});
    });
};

const downloadexcel = (res, roleid) => {
	let workbook = new excel.Workbook();
	if(roleid === '3'){
		let worksheet = workbook.addWorksheet("Data Siswa");
		let worksheetAgama = workbook.addWorksheet("Agama");
		let worksheetHobi = workbook.addWorksheet("Hobi");
		let worksheetCitaCita = workbook.addWorksheet("Cita - Cita");
		let worksheetJenjangSekolah = workbook.addWorksheet("Jenjang Sekolah");
		let worksheetStatusSekolah = workbook.addWorksheet("Status Sekolah");
		let worksheetStatusOrangTua = workbook.addWorksheet("Status Orang Tua");
		let worksheetPendidikan = workbook.addWorksheet("Pendidikan");
		let worksheetPekerjaan = workbook.addWorksheet("Pekerjaan");
		let worksheetStatusTempatTinggal = workbook.addWorksheet("Status Tempat Tinggal");
		let worksheetJarakRumah = workbook.addWorksheet("Jarak Rumah");
		let worksheetAlatTransportasi = workbook.addWorksheet("Alat Transportasi");
		let worksheetPenghasilan = workbook.addWorksheet("Penghasilan");

		//Data Siswa
		worksheet.columns = [
			{ header: "NAMA", key: "name", width: 20 },
			{ header: "EMAIL", key: "email", width: 20 },
			{ header: "NIK SISWA", key: "nik_siswa", width: 20 },
			{ header: "NISN", key: "nomor_induk", width: 20 },
			{ header: "TANGGAL LAHIR", key: "tgl_lahir", width: 20 },
			{ header: "TEMPAT", key: "tempat", width: 20 },
			{ header: "JENIS KELAMIN", key: "jeniskelamin", width: 20 },
			{ header: "AGAMA", key: "agama", width: 20 },
			{ header: "ANAK KE", key: "anakke", width: 20 },
			{ header: "JUMLAH SAUDARA", key: "jumlah_saudara", width: 20 },
			{ header: "HOBI", key: "hobi", width: 20 },
			{ header: "CITA-CITA", key: "cita_cita", width: 20 },
			{ header: "JENJANG SEKOLAH", key: "jenjang", width: 20 },
			{ header: "NAMA SEKOLAH", key: "nama_sekolah", width: 20 },
			{ header: "STATUS SEKOLAH", key: "status_sekolah", width: 20 },
			{ header: "NPSN", key: "npsn", width: 20 },
			{ header: "ALAMAT SEKOLAH", key: "alamat_sekolah", width: 40 },
			{ header: "KABUPATEN / KOTA SEKOLAH SEBELUMNYA", key: "kabkot_sekolah", width: 20 },
			{ header: "NOMOR KK", key: "no_kk", width: 20 },
			{ header: "NAMA KEPALA KELUARGA", key: "nama_kk", width: 20 },
			{ header: "NIK AYAH", key: "nik_ayah", width: 20 },
			{ header: "NAMA AYAH", key: "nama_ayah", width: 20 },
			{ header: "TAHUN AYAH", key: "tahun_ayah", width: 20 },
			{ header: "STATUS AYAH", key: "status_ayah", width: 20 },
			{ header: "PENDIDIKAN AYAH", key: "pendidikan_ayah", width: 20 },
			{ header: "PEKERJAAN AYAH", key: "pekerjaan_ayah", width: 20 },
			{ header: "NO HANDPHONE AYAH", key: "telp_ayah", width: 20 },
			{ header: "NIK IBU", key: "nik_ibu", width: 20 },
			{ header: "NAMA IBU", key: "nama_ibu", width: 20 },
			{ header: "TAHUN IBU", key: "tahun_ibu", width: 20 },
			{ header: "STATUS IBU", key: "status_ibu", width: 20 },
			{ header: "PENDIDIKAN IBU", key: "pendidikan_ibu", width: 20 },
			{ header: "PEKERJAAN IBU", key: "pekerjaan_ibu", width: 20 },
			{ header: "NO HANDPHONE IBU", key: "telp_ibu", width: 20 },
			{ header: "TELEPON", key: "telp", width: 20 },
			{ header: "ALAMAT", key: "alamat", width: 40 },
			{ header: "PROVINSI", key: "provinsi", width: 20 },
			{ header: "KABUPATEN / KOTA", key: "kabkota", width: 20 },
			{ header: "KECAMATAN", key: "kecamatan", width: 20 },
			{ header: "KELURAHAN", key: "kelurahan", width: 20 },
			{ header: "KODE POS", key: "kode_pos", width: 20 },
			{ header: "PENGHASILAN", key: "penghasilan", width: 20 },
		];
		const figureColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 ,19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];
		figureColumns.forEach((i) => {
			worksheet.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheet.addRows([{
			name: 'tes', 
			email: 'tes@gmail.com', 
			nik_siswa: '123', 
			nomor_induk: '123', 
			tgl_lahir: new Date(),
			tempat: 'Bogor', 
			jeniskelamin: 'Laki - Laki', 
			agama: 'Islam', 
			anakke: '1', 
			jumlah_saudara: '1', 
			hobi: '1', 
			cita_cita: '1', 
			jenjang: '1', 
			nama_sekolah: 'SD. Teka Teki', 
			status_sekolah: '1', 
			npsn: '123', 
			alamat_sekolah: 'Bogor', 
			kabkot_sekolah: '32.01', 
			no_kk: '123', 
			nama_kk: 'Andre', 
			nik_ayah: '123', 
			nama_ayah: 'Andre', 
			tahun_ayah: '1970', 
			status_ayah: '1', 
			pendidikan_ayah: '1', 
			pekerjaan_ayah: '1', 
			telp_ayah: '123456789', 
			nik_ibu: '123', 
			nama_ibu: 'Susi', 
			tahun_ibu: '1989', 
			status_ibu: '1', 
			pendidikan_ibu: '1', 
			pekerjaan_ibu: '1', 
			telp_ibu: '123456789', 
			telp: '123456789', 
			alamat: 'Bogor', 
			provinsi: '32', 
			kabkota: '32.01', 
			kecamatan: '32.01.01', 
			kelurahan: '32.01.01.1002', 
			kode_pos: '16913',
			penghasilan: '1',
		}]);
		
		//Pil Agama
		worksheetAgama.columns = [
			{ header: "KODE", key: "kode", width: 15 },
			{ header: "LABEL", key: "label", width: 15 }
		];
		const figureColumnsAgama = [1, 2];
		figureColumnsAgama.forEach((i) => {
			worksheetAgama.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetAgama.addRows([
			{ kode: 'Islam', label: 'Islam' },
			{ kode: 'Katolik', label: 'Katolik' },
			{ kode: 'Protestan', label: 'Protestan' },
			{ kode: 'Hindu', label: 'Hindu' },
			{ kode: 'Budha', label: 'Budha' }
		]);

		//Pil Hobi
		worksheetHobi.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsHobi = [1, 2];
		figureColumnsHobi.forEach((i) => {
			worksheetHobi.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetHobi.addRows([
			{ kode: '1', label: 'Olahraga' },
			{ kode: '2', label: 'Kesenian' },
			{ kode: '3', label: 'Membaca' },
			{ kode: '4', label: 'Menulis' },
			{ kode: '5', label: 'Traveling' },
			{ kode: '6', label: 'Lainnya' },
		]);

		//Pil CitaCita
		worksheetCitaCita.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsCitaCita = [1, 2];
		figureColumnsCitaCita.forEach((i) => {
			worksheetCitaCita.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetCitaCita.addRows([
			{ kode: '1', label: 'PNS' },
			{ kode: '2', label: 'TNI/PORLI' },
			{ kode: '3', label: 'Guru/Dosen' },
			{ kode: '4', label: 'Dokter' },
			{ kode: '5', label: 'Politikus' },
			{ kode: '6', label: 'Wiraswasta' },
			{ kode: '7', label: 'Pekerja Seni/Lukis/Artis/Sejenis' },
			{ kode: '8', label: 'Lainnya' },
		]);

		//Pil JenjangSekolah
		worksheetJenjangSekolah.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsJenjangSekolah = [1, 2];
		figureColumnsJenjangSekolah.forEach((i) => {
			worksheetJenjangSekolah.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetJenjangSekolah.addRows([
			{ kode: '1', label: 'MI' },
			{ kode: '2', label: 'SD' },
			{ kode: '3', label: 'SD Terbuka' },
			{ kode: '4', label: 'SLB-MI' },
			{ kode: '5', label: 'Paket A' },
			{ kode: '6', label: 'Salafiyah Ula' },
			{ kode: '7', label: 'MU`adalah MI' },
			{ kode: '8', label: 'SLB-SD' },
			{ kode: '9', label: 'Lainnya' },
		]);

		//Pil StatusSekolah
		worksheetStatusSekolah.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsStatusSekolah = [1, 2];
		figureColumnsStatusSekolah.forEach((i) => {
			worksheetStatusSekolah.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetStatusSekolah.addRows([
			{ kode: '1', label: 'Negeri' },
			{ kode: '2', label: 'Swasta' },
		]);

		//Pil StatusOrangTua
		worksheetStatusOrangTua.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsStatusOrangTua = [1, 2];
		figureColumnsStatusOrangTua.forEach((i) => {
			worksheetStatusOrangTua.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetStatusOrangTua.addRows([
			{ kode: '1', label: 'Masih Hidup' },
			{ kode: '2', label: 'Sudah Mati' },
			{ kode: '3', label: 'Tidak Diketahui' },
		]);

		//Pil Pendidikan
		worksheetPendidikan.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsPendidikan = [1, 2];
		figureColumnsPendidikan.forEach((i) => {
			worksheetPendidikan.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetPendidikan.addRows([
			{ kode: '0', label: 'Tidak Berpendidikan Formal' },
			{ kode: '1', label: 'SD/Sederajat' },
			{ kode: '2', label: 'SMP/Sederajat' },
			{ kode: '3', label: 'SMA/Sederajat' },
			{ kode: '4', label: 'D1' },
			{ kode: '5', label: 'D2' },
			{ kode: '6', label: 'D3' },
			{ kode: '7', label: 'S1' },
			{ kode: '8', label: 'S2' },
			{ kode: '9', label: '>S2' },
		]);

		//Pil Pekerjaan
		worksheetPekerjaan.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsPekerjaan = [1, 2];
		figureColumnsPekerjaan.forEach((i) => {
			worksheetPekerjaan.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetPekerjaan.addRows([
			{ kode: '1', label: 'Tidak Bekerja' },
			{ kode: '2', label: 'Pensiunan/Almarhum' },
			{ kode: '3', label: 'PNS (selain Guru/Dosen/Dokter/Bidan/Perawat)' },
			{ kode: '4', label: 'TNI/Polisi' },
			{ kode: '5', label: 'Guru/Dosen' },
			{ kode: '6', label: 'Pegawai Swasta' },
			{ kode: '7', label: 'Pengusaha/Wiraswasta' },
			{ kode: '8', label: 'Pengacara/Hakim/Jaksa/Notaris' },
			{ kode: '9', label: 'Seniman/Pelukis/Artis/Sejenis' },
			{ kode: '10', label: 'Dokter/Bidan/Perawat' },
			{ kode: '11', label: 'Pilot/Pramugari' },
			{ kode: '12', label: 'Pedagang' },
			{ kode: '13', label: 'Petani/Peternak' },
			{ kode: '14', label: 'Nelayan' },
			{ kode: '15', label: 'Buruh (Tani/Pabrik/Bangunan)' },
			{ kode: '16', label: 'Sopir/Masinis/Kondektur' },
			{ kode: '17', label: 'Politikus' },
			{ kode: '18', label: 'Lainnya' },
		]);

		//Pil StatusTempatTinggal
		worksheetStatusTempatTinggal.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsStatusTempatTinggal = [1, 2];
		figureColumnsStatusTempatTinggal.forEach((i) => {
			worksheetStatusTempatTinggal.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetStatusTempatTinggal.addRows([
			{ kode: '1', label: 'Milik' },
			{ kode: '2', label: 'Rumah Orangtua' },
			{ kode: '3', label: 'Rumah Saudara/Kerabat' },
			{ kode: '4', label: 'Rumah Dinas' },
		]);

		//Pil JarakRumah
		worksheetJarakRumah.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsJarakRumah = [1, 2];
		figureColumnsJarakRumah.forEach((i) => {
			worksheetJarakRumah.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetJarakRumah.addRows([
			{ kode: '1', label: '< 1 Km' },
			{ kode: '2', label: '1 - 3 Km' },
			{ kode: '3', label: '3 - 5 Km' },
			{ kode: '4', label: '5 - 10 Km' },
			{ kode: '5', label: '> 10 Km' },
		]);

		//Pil AlatTransportasi
		worksheetAlatTransportasi.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsAlatTransportasi = [1, 2];
		figureColumnsAlatTransportasi.forEach((i) => {
			worksheetAlatTransportasi.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetAlatTransportasi.addRows([
			{ kode: '1', label: 'Jalan Kaki' },
			{ kode: '2', label: 'Sepeda' },
			{ kode: '3', label: 'Sepeda Motor' },
			{ kode: '4', label: 'Mobil Pribadi' },
			{ kode: '5', label: 'Antar Jemput Sekolah' },
			{ kode: '6', label: 'Angkutan Umum' },
			{ kode: '7', label: 'Perahu/Sampan' },
			{ kode: '8', label: 'Lainnya' },
		]);

		//Pil Penghasilan
		worksheetPenghasilan.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsPenghasilan = [1, 2];
		figureColumnsPenghasilan.forEach((i) => {
			worksheetPenghasilan.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetPenghasilan.addRows([
			{ kode: '1', label: '<= Rp 500.000' },
			{ kode: '2', label: 'Rp 500.001 - Rp 1.000.000' },
			{ kode: '3', label: 'Rp 1.000.001 - Rp 2.000.000' },
			{ kode: '4', label: 'Rp 2.000.001 - Rp 3.000.000' },
			{ kode: '5', label: 'Rp 3.000.001 - Rp 5.000.000' },
			{ kode: '6', label: '> Rp 5.000.000' },
		]);

		res.setHeader(
			"Content-Disposition",
			"attachment; filename=TemplateDataSiswa.xlsx"
		);
	}else if(roleid === '2'){
		let worksheet = workbook.addWorksheet("Data Guru");
		let worksheetAgama = workbook.addWorksheet("Agama");
		let worksheetPendidikan = workbook.addWorksheet("Pendidikan");
		let worksheetJabatan = workbook.addWorksheet("Jabatan");
		let worksheetBidangMengajar = workbook.addWorksheet("Bidang Mengajar");

		//Data Guru
		worksheet.columns = [
			{ header: "NAMA", key: "name", width: 20 },
			{ header: "EMAIL", key: "email", width: 20 },
			{ header: "TANGGAL LAHIR", key: "tgl_lahir", width: 20 },
			{ header: "TEMPAT", key: "tempat", width: 20 },
			{ header: "JENIS KELAMIN", key: "jeniskelamin", width: 20 },
			{ header: "AGAMA", key: "agama", width: 20 },
			{ header: "PENDIDIKAN TERAKHIR", key: "pendidikan_guru", width: 25 },
			{ header: "JABATAN", key: "jabatan_guru", width: 20 },
			{ header: "MENGAJAR BIDANG", key: "mengajar_bidang", width: 20 },
			{ header: "MENGAJAR KELAS", key: "mengajar_kelas", width: 20 },
			{ header: "TELEPON", key: "telp", width: 20 },
			{ header: "ALAMAT", key: "alamat", width: 40 },
			{ header: "PROVINSI", key: "provinsi", width: 20 },
			{ header: "KABUPATEN / KOTA", key: "kabkota", width: 20 },
			{ header: "KECAMATAN", key: "kecamatan", width: 20 },
			{ header: "KELURAHAN", key: "kelurahan", width: 20 },
			{ header: "KODE POS", key: "kode_pos", width: 20 },
		];
		const figureColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
		figureColumns.forEach((i) => {
			worksheet.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheet.addRows([{
			name: 'tes', 
			email: 'tes@gmail.com',
			tgl_lahir: new Date(),
			tempat: 'Bogor', 
			jeniskelamin: 'Laki - Laki', 
			agama: 'Islam',  
			pendidikan_guru: '5',  
			jabatan_guru: 'Staff TU',  
			mengajar_bidang: 'PKN',  
			mengajar_kelas: '7,8,9',  
			telp: '123456789', 
			alamat: 'Bogor', 
			provinsi: '32', 
			kabkota: '32.01', 
			kecamatan: '32.01.01', 
			kelurahan: '32.01.01.1002', 
			kode_pos: '16913',
		}]);

		//Pil Agama
		worksheetAgama.columns = [
			{ header: "KODE", key: "kode", width: 15 },
			{ header: "LABEL", key: "label", width: 15 }
		];
		const figureColumnsAgama = [1, 2];
		figureColumnsAgama.forEach((i) => {
			worksheetAgama.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetAgama.addRows([
			{ kode: 'Islam', label: 'Islam' },
			{ kode: 'Katolik', label: 'Katolik' },
			{ kode: 'Protestan', label: 'Protestan' },
			{ kode: 'Hindu', label: 'Hindu' },
			{ kode: 'Budha', label: 'Budha' }
		]);

		//Pil Pendidikan
		worksheetPendidikan.columns = [
			{ header: "KODE", key: "kode", width: 10 },
			{ header: "LABEL", key: "label", width: 50 }
		];
		const figureColumnsPendidikan = [1, 2];
		figureColumnsPendidikan.forEach((i) => {
			worksheetPendidikan.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetPendidikan.addRows([
			{ kode: '0', label: 'Tidak Berpendidikan Formal' },
			{ kode: '1', label: 'SD/Sederajat' },
			{ kode: '2', label: 'SMP/Sederajat' },
			{ kode: '3', label: 'SMA/Sederajat' },
			{ kode: '4', label: 'D1' },
			{ kode: '5', label: 'D2' },
			{ kode: '6', label: 'D3' },
			{ kode: '7', label: 'S1' },
			{ kode: '8', label: 'S2' },
			{ kode: '9', label: '>S2' },
		]);

		//Pil Jabatan
		worksheetJabatan.columns = [
			{ header: "KODE", key: "kode", width: 30 },
			{ header: "LABEL", key: "label", width: 30 }
		];
		const figureColumnsJabatan = [1, 2];
		figureColumnsJabatan.forEach((i) => {
			worksheetJabatan.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetJabatan.addRows([
			{ value: 'Kepala Sekolah', label: 'Kepala Sekolah' },
			{ value: 'WaKaBid. Kesiswaan', label: 'WaKaBid. Kesiswaan' },
			{ value: 'WaKaBid. Kurikulum', label: 'WaKaBid. Kurikulum' },
			{ value: 'WaKaBid. Sarpras', label: 'WaKaBid. Sarpras' },
			{ value: 'Kepala TU', label: 'Kepala TU' },
			{ value: 'Staff TU', label: 'Staff TU' },
			{ value: 'Wali Kelas', label: 'Wali Kelas' },
			{ value: 'BP / BK', label: 'BP / BK' },
			{ value: 'Pembina Osis', label: 'Pembina Osis' },
			{ value: 'Pembina Pramuka', label: 'Pembina Pramuka' },
			{ value: 'Pembina Paskibra', label: 'Pembina Paskibra' },
		]);

		//Pil Bidang Mengajar
		worksheetBidangMengajar.columns = [
			{ header: "KODE", key: "kode", width: 30 },
			{ header: "LABEL", key: "label", width: 30 }
		];
		const figureColumnsBidangworksheetBidangMengajar = [1, 2];
		figureColumnsBidangworksheetBidangMengajar.forEach((i) => {
			worksheetBidangMengajar.getColumn(i).alignment = { horizontal: "left" };
		});
		worksheetBidangMengajar.addRows([
			{ kode: 'Alquran Hadits', label: 'Alquran Hadits' },
			{ kode: 'Aqidah Akhlak', label: 'Aqidah Akhlak' },
			{ kode: 'Bahasa Arab', label: 'Bahasa Arab' },
			{ kode: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
			{ kode: 'Bahasa Inggris', label: 'Bahasa Inggris' },
			{ kode: 'Bahasa Sunda', label: 'Bahasa Sunda' },
			{ kode: 'BTQ', label: 'BTQ' },
			{ kode: 'Fiqih', label: 'Fiqih' },
			{ kode: 'IPA Terpadu', label: 'IPA Terpadu' },
			{ kode: 'IPS Terpadu', label: 'IPS Terpadu' },
			{ kode: 'Matematika', label: 'Matematika' },
			{ kode: 'Penjasorkes', label: 'Penjasorkes' },
			{ kode: 'PKN', label: 'PKN' },
			{ kode: 'Prakarya', label: 'Prakarya' },
			{ kode: 'Seni Budaya', label: 'Seni Budaya' },
			{ kode: 'SKI', label: 'SKI' },
		]);

		res.setHeader(
			"Content-Disposition",
			"attachment; filename=TemplateDataGuru.xlsx"
		);
	}
	
	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);
  
    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
    });
}

const importData = async(res, checkData, InsertUsers, InsertUsersDetails, data) => {
	for (const [k, v] of Object.entries(data)) {
		const kodeOTP = makeRandom(8)
		const salt = await bcrypt.genSalt();
		const hashPassword = await bcrypt.hash(kodeOTP, salt);
		const kirimdata1 = {
			name: v.name,
			email: v.email,
			roleID: '3',
			password: hashPassword,
			activeAkun: '1',
			kodeOTP: kodeOTP
		}
		koneksi.query(InsertUsers, kirimdata1, (err, result, field) => {
			// error handling
			if (err) {
				return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
			}
			koneksi.query(checkData, v.email, async(err, result, field) => {
				// error handling
				if (err) {
					return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
				}
				const kirimdata2 = {
					id_profile: result[0].id,
					nomor_induk: v.nomor_induk,
					nik_siswa: v.nik_siswa,
					tempat: v.tempat,
					tgl_lahir: v.tgl_lahir,
					jeniskelamin: v.jeniskelamin,
					agama: v.agama,
					telp: v.telp,
					alamat: v.alamat,
					provinsi: v.provinsi,
					kabkota: v.kabkota,
					kecamatan: v.kecamatan,
					kelurahan: v.kelurahan,
					kode_pos: v.kode_pos,
					anakke: v.anakke,
					jumlah_saudara: v.jumlah_saudara,
					hobi: v.hobi,
					cita_cita: v.cita_cita,
					jenjang: v.jenjang,
					status_sekolah: v.status_sekolah,
					nama_sekolah: v.nama_sekolah,
					npsn: v.npsn,
					alamat_sekolah: v.alamat_sekolah,
					kabkot_sekolah: v.kabkot_sekolah,
					no_kk: v.no_kk,
					nama_kk: v.nama_kk,
					penghasilan: v.penghasilan,
					nik_ayah: v.nik_ayah,
					nama_ayah: v.nama_ayah,
					tahun_ayah: v.tahun_ayah,
					status_ayah: v.status_ayah,
					pendidikan_ayah: v.pendidikan_ayah,
					pekerjaan_ayah: v.pekerjaan_ayah,
					telp_ayah: v.telp_ayah,
					nik_ibu: v.nik_ibu,
					nama_ibu: v.nama_ibu,
					tahun_ibu: v.tahun_ibu,
					status_ibu: v.status_ibu,
					pendidikan_ibu: v.pendidikan_ibu,
					pekerjaan_ibu: v.pekerjaan_ibu,
					telp_ibu: v.telp_ibu,
				}
				// jika request berhasil
				koneksi.query(InsertUsersDetails, kirimdata2, (err, result, field) => {
					// error handling
					if (err) {
						return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
					}
				});
			});
		});
	}
	// jika request berhasil
	kode = 200
	message = 'Data berhasil disimpan'
	response(res, { kode, message }, 200);
}

const exportexcel = (res, Select, cari, kategori) => {
	// jalankan query
	const cariData = {
		roleid: kategori.export === 'dariAdmin' ? cari : null, 
		kelas: kategori.export === 'dariAdmin' ? null : cari, 
		cetak: kategori.export === 'dariAdmin' ? cari : '3'
	}
	koneksi.query(Select, [cariData.roleid, cariData.kelas], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }

		let workbook = new excel.Workbook();
		if(cariData.cetak === '3'){
			let worksheet = workbook.addWorksheet("Data Siswa");
			let worksheetAgama = workbook.addWorksheet("Agama");
			let worksheetHobi = workbook.addWorksheet("Hobi");
			let worksheetCitaCita = workbook.addWorksheet("Cita - Cita");
			let worksheetJenjangSekolah = workbook.addWorksheet("Jenjang Sekolah");
			let worksheetStatusSekolah = workbook.addWorksheet("Status Sekolah");
			let worksheetStatusOrangTua = workbook.addWorksheet("Status Orang Tua");
			let worksheetPendidikan = workbook.addWorksheet("Pendidikan");
			let worksheetPekerjaan = workbook.addWorksheet("Pekerjaan");
			let worksheetStatusTempatTinggal = workbook.addWorksheet("Status Tempat Tinggal");
			let worksheetJarakRumah = workbook.addWorksheet("Jarak Rumah");
			let worksheetAlatTransportasi = workbook.addWorksheet("Alat Transportasi");
			let worksheetPenghasilan = workbook.addWorksheet("Penghasilan");

			//Data Siswa
			worksheet.columns = [
				{ header: "NAMA", key: "name", width: 20 },
				{ header: "EMAIL", key: "email", width: 20 },
				{ header: "NIK SISWA", key: "nik_siswa", width: 20 },
				{ header: "NISN", key: "nomor_induk", width: 20 },
				{ header: "TANGGAL LAHIR", key: "tgl_lahir", width: 20 },
				{ header: "TEMPAT", key: "tempat", width: 20 },
				{ header: "JENIS KELAMIN", key: "jeniskelamin", width: 20 },
				{ header: "AGAMA", key: "agama", width: 20 },
				{ header: "ANAK KE", key: "anakke", width: 20 },
				{ header: "JUMLAH SAUDARA", key: "jumlah_saudara", width: 20 },
				{ header: "HOBI", key: "hobi", width: 20 },
				{ header: "CITA-CITA", key: "cita_cita", width: 20 },
				{ header: "JENJANG SEKOLAH", key: "jenjang", width: 20 },
				{ header: "NAMA SEKOLAH", key: "nama_sekolah", width: 20 },
				{ header: "STATUS SEKOLAH", key: "status_sekolah", width: 20 },
				{ header: "NPSN", key: "npsn", width: 20 },
				{ header: "ALAMAT SEKOLAH", key: "alamat_sekolah", width: 40 },
				{ header: "KABUPATEN / KOTA SEKOLAH SEBELUMNYA", key: "kabkot_sekolah", width: 20 },
				{ header: "NOMOR KK", key: "no_kk", width: 20 },
				{ header: "NAMA KEPALA KELUARGA", key: "nama_kk", width: 20 },
				{ header: "NIK AYAH", key: "nik_ayah", width: 20 },
				{ header: "NAMA AYAH", key: "nama_ayah", width: 20 },
				{ header: "TAHUN AYAH", key: "tahun_ayah", width: 20 },
				{ header: "STATUS AYAH", key: "status_ayah", width: 20 },
				{ header: "PENDIDIKAN AYAH", key: "pendidikan_ayah", width: 20 },
				{ header: "PEKERJAAN AYAH", key: "pekerjaan_ayah", width: 20 },
				{ header: "NO HANDPHONE AYAH", key: "telp_ayah", width: 20 },
				{ header: "NIK IBU", key: "nik_ibu", width: 20 },
				{ header: "NAMA IBU", key: "nama_ibu", width: 20 },
				{ header: "TAHUN IBU", key: "tahun_ibu", width: 20 },
				{ header: "STATUS IBU", key: "status_ibu", width: 20 },
				{ header: "PENDIDIKAN IBU", key: "pendidikan_ibu", width: 20 },
				{ header: "PEKERJAAN IBU", key: "pekerjaan_ibu", width: 20 },
				{ header: "NO HANDPHONE IBU", key: "telp_ibu", width: 20 },
				{ header: "NIK WALI", key: "nik_wali", width: 20 },
				{ header: "NAMA WALI", key: "nama_wali", width: 20 },
				{ header: "TAHUN WALI", key: "tahun_wali", width: 20 },
				{ header: "PENDIDIKAN WALI", key: "pendidikan_wali", width: 20 },
				{ header: "PEKERJAAN WALI", key: "pekerjaan_wali", width: 20 },
				{ header: "NO HANDPHONE WALI", key: "telp_wali", width: 20 },
				{ header: "TELEPON", key: "telp", width: 20 },
				{ header: "ALAMAT", key: "alamat", width: 40 },
				{ header: "PROVINSI", key: "provinsi", width: 20 },
				{ header: "KABUPATEN / KOTA", key: "kabkota", width: 20 },
				{ header: "KECAMATAN", key: "kecamatan", width: 20 },
				{ header: "KELURAHAN", key: "kelurahan", width: 20 },
				{ header: "KODE POS", key: "kode_pos", width: 20 },
				{ header: "PENGHASILAN", key: "penghasilan", width: 20 },
				{ header: "STATUS TEMPAT TINGGAL", key: "status_tempat_tinggal", width: 20 },
				{ header: "JARAK RUMAH", key: "jarak_rumah", width: 20 },
				{ header: "ALAT TRANSPORTASI", key: "transportasi", width: 20 },
				{ header: "BERKAS IJAZAH", key: "fc_ijazah", width: 20 },
				{ header: "BERKAS KARTU KELUARGA", key: "fc_kk", width: 20 },
				{ header: "BERKAS KTP ORANG TUA", key: "fc_ktp_ortu", width: 20 },
				{ header: "BERKAS AKTA LAHIR", key: "fc_akta_lahir", width: 20 },
				{ header: "BERKAS SURAT KETERANGAN LULUS", key: "fc_skl", width: 20 },
			];
			const figureColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
				11, 12, 13, 14, 15, 16, 17, 18 ,19, 20, 
				21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
				31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
				41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
				51, 52, 53, 54, 55, 56];
			figureColumns.forEach((i) => {
				worksheet.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheet.addRows(result);
			
			//Pil Agama
			worksheetAgama.columns = [
				{ header: "KODE", key: "kode", width: 15 },
				{ header: "LABEL", key: "label", width: 15 }
			];
			const figureColumnsAgama = [1, 2];
			figureColumnsAgama.forEach((i) => {
				worksheetAgama.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetAgama.addRows([
				{ kode: 'Islam', label: 'Islam' },
				{ kode: 'Katolik', label: 'Katolik' },
				{ kode: 'Protestan', label: 'Protestan' },
				{ kode: 'Hindu', label: 'Hindu' },
				{ kode: 'Budha', label: 'Budha' }
			]);

			//Pil Hobi
			worksheetHobi.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsHobi = [1, 2];
			figureColumnsHobi.forEach((i) => {
				worksheetHobi.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetHobi.addRows([
				{ kode: '1', label: 'Olahraga' },
				{ kode: '2', label: 'Kesenian' },
				{ kode: '3', label: 'Membaca' },
				{ kode: '4', label: 'Menulis' },
				{ kode: '5', label: 'Traveling' },
				{ kode: '6', label: 'Lainnya' },
			]);

			//Pil CitaCita
			worksheetCitaCita.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsCitaCita = [1, 2];
			figureColumnsCitaCita.forEach((i) => {
				worksheetCitaCita.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetCitaCita.addRows([
				{ kode: '1', label: 'PNS' },
				{ kode: '2', label: 'TNI/PORLI' },
				{ kode: '3', label: 'Guru/Dosen' },
				{ kode: '4', label: 'Dokter' },
				{ kode: '5', label: 'Politikus' },
				{ kode: '6', label: 'Wiraswasta' },
				{ kode: '7', label: 'Pekerja Seni/Lukis/Artis/Sejenis' },
				{ kode: '8', label: 'Lainnya' },
			]);

			//Pil JenjangSekolah
			worksheetJenjangSekolah.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsJenjangSekolah = [1, 2];
			figureColumnsJenjangSekolah.forEach((i) => {
				worksheetJenjangSekolah.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetJenjangSekolah.addRows([
				{ kode: '1', label: 'MI' },
				{ kode: '2', label: 'SD' },
				{ kode: '3', label: 'SD Terbuka' },
				{ kode: '4', label: 'SLB-MI' },
				{ kode: '5', label: 'Paket A' },
				{ kode: '6', label: 'Salafiyah Ula' },
				{ kode: '7', label: 'MU`adalah MI' },
				{ kode: '8', label: 'SLB-SD' },
				{ kode: '9', label: 'Lainnya' },
			]);

			//Pil StatusSekolah
			worksheetStatusSekolah.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsStatusSekolah = [1, 2];
			figureColumnsStatusSekolah.forEach((i) => {
				worksheetStatusSekolah.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetStatusSekolah.addRows([
				{ kode: '1', label: 'Negeri' },
				{ kode: '2', label: 'Swasta' },
			]);

			//Pil StatusOrangTua
			worksheetStatusOrangTua.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsStatusOrangTua = [1, 2];
			figureColumnsStatusOrangTua.forEach((i) => {
				worksheetStatusOrangTua.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetStatusOrangTua.addRows([
				{ kode: '1', label: 'Masih Hidup' },
				{ kode: '2', label: 'Sudah Mati' },
				{ kode: '3', label: 'Tidak Diketahui' },
			]);

			//Pil Pendidikan
			worksheetPendidikan.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsPendidikan = [1, 2];
			figureColumnsPendidikan.forEach((i) => {
				worksheetPendidikan.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetPendidikan.addRows([
				{ kode: '0', label: 'Tidak Berpendidikan Formal' },
				{ kode: '1', label: 'SD/Sederajat' },
				{ kode: '2', label: 'SMP/Sederajat' },
				{ kode: '3', label: 'SMA/Sederajat' },
				{ kode: '4', label: 'D1' },
				{ kode: '5', label: 'D2' },
				{ kode: '6', label: 'D3' },
				{ kode: '7', label: 'S1' },
				{ kode: '8', label: 'S2' },
				{ kode: '9', label: '>S2' },
			]);

			//Pil Pekerjaan
			worksheetPekerjaan.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsPekerjaan = [1, 2];
			figureColumnsPekerjaan.forEach((i) => {
				worksheetPekerjaan.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetPekerjaan.addRows([
				{ kode: '1', label: 'Tidak Bekerja' },
				{ kode: '2', label: 'Pensiunan/Almarhum' },
				{ kode: '3', label: 'PNS (selain Guru/Dosen/Dokter/Bidan/Perawat)' },
				{ kode: '4', label: 'TNI/Polisi' },
				{ kode: '5', label: 'Guru/Dosen' },
				{ kode: '6', label: 'Pegawai Swasta' },
				{ kode: '7', label: 'Pengusaha/Wiraswasta' },
				{ kode: '8', label: 'Pengacara/Hakim/Jaksa/Notaris' },
				{ kode: '9', label: 'Seniman/Pelukis/Artis/Sejenis' },
				{ kode: '10', label: 'Dokter/Bidan/Perawat' },
				{ kode: '11', label: 'Pilot/Pramugari' },
				{ kode: '12', label: 'Pedagang' },
				{ kode: '13', label: 'Petani/Peternak' },
				{ kode: '14', label: 'Nelayan' },
				{ kode: '15', label: 'Buruh (Tani/Pabrik/Bangunan)' },
				{ kode: '16', label: 'Sopir/Masinis/Kondektur' },
				{ kode: '17', label: 'Politikus' },
				{ kode: '18', label: 'Lainnya' },
			]);

			//Pil StatusTempatTinggal
			worksheetStatusTempatTinggal.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsStatusTempatTinggal = [1, 2];
			figureColumnsStatusTempatTinggal.forEach((i) => {
				worksheetStatusTempatTinggal.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetStatusTempatTinggal.addRows([
				{ kode: '1', label: 'Milik' },
				{ kode: '2', label: 'Rumah Orangtua' },
				{ kode: '3', label: 'Rumah Saudara/Kerabat' },
				{ kode: '4', label: 'Rumah Dinas' },
			]);

			//Pil JarakRumah
			worksheetJarakRumah.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsJarakRumah = [1, 2];
			figureColumnsJarakRumah.forEach((i) => {
				worksheetJarakRumah.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetJarakRumah.addRows([
				{ kode: '1', label: '< 1 Km' },
				{ kode: '2', label: '1 - 3 Km' },
				{ kode: '3', label: '3 - 5 Km' },
				{ kode: '4', label: '5 - 10 Km' },
				{ kode: '5', label: '> 10 Km' },
			]);

			//Pil AlatTransportasi
			worksheetAlatTransportasi.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsAlatTransportasi = [1, 2];
			figureColumnsAlatTransportasi.forEach((i) => {
				worksheetAlatTransportasi.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetAlatTransportasi.addRows([
				{ kode: '1', label: 'Jalan Kaki' },
				{ kode: '2', label: 'Sepeda' },
				{ kode: '3', label: 'Sepeda Motor' },
				{ kode: '4', label: 'Mobil Pribadi' },
				{ kode: '5', label: 'Antar Jemput Sekolah' },
				{ kode: '6', label: 'Angkutan Umum' },
				{ kode: '7', label: 'Perahu/Sampan' },
				{ kode: '8', label: 'Lainnya' },
			]);

			//Pil Penghasilan
			worksheetPenghasilan.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsPenghasilan = [1, 2];
			figureColumnsPenghasilan.forEach((i) => {
				worksheetPenghasilan.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetPenghasilan.addRows([
				{ kode: '1', label: '<= Rp 500.000' },
				{ kode: '2', label: 'Rp 500.001 - Rp 1.000.000' },
				{ kode: '3', label: 'Rp 1.000.001 - Rp 2.000.000' },
				{ kode: '4', label: 'Rp 2.000.001 - Rp 3.000.000' },
				{ kode: '5', label: 'Rp 3.000.001 - Rp 5.000.000' },
				{ kode: '6', label: '> Rp 5.000.000' },
			]);

			res.setHeader(
				"Content-Disposition",
				"attachment; filename=TemplateDataSiswa.xlsx"
			);
		}else if(cariData.cetak === '2'){
			let worksheet = workbook.addWorksheet("Data Guru");
			let worksheetAgama = workbook.addWorksheet("Agama");
			let worksheetPendidikan = workbook.addWorksheet("Pendidikan");
			let worksheetJabatan = workbook.addWorksheet("Jabatan");
			let worksheetBidangMengajar = workbook.addWorksheet("Bidang Mengajar");

			//Data Guru
			worksheet.columns = [
				{ header: "NAMA", key: "name", width: 20 },
				{ header: "EMAIL", key: "email", width: 20 },
				{ header: "TANGGAL LAHIR", key: "tgl_lahir", width: 20 },
				{ header: "TEMPAT", key: "tempat", width: 20 },
				{ header: "JENIS KELAMIN", key: "jeniskelamin", width: 20 },
				{ header: "AGAMA", key: "agama", width: 20 },
				{ header: "PENDIDIKAN TERAKHIR", key: "pendidikan_guru", width: 25 },
				{ header: "JABATAN", key: "jabatan_guru", width: 20 },
				{ header: "MENGAJAR BIDANG", key: "mengajar_bidang", width: 20 },
				{ header: "MENGAJAR KELAS", key: "mengajar_kelas", width: 20 },
				{ header: "WALI KELAS", key: "walikelas", width: 20 },
				{ header: "TELEPON", key: "telp", width: 20 },
				{ header: "ALAMAT", key: "alamat", width: 40 },
				{ header: "PROVINSI", key: "provinsi", width: 20 },
				{ header: "KABUPATEN / KOTA", key: "kabkota", width: 20 },
				{ header: "KECAMATAN", key: "kecamatan", width: 20 },
				{ header: "KELURAHAN", key: "kelurahan", width: 20 },
				{ header: "KODE POS", key: "kode_pos", width: 20 },
			];
			const figureColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
			figureColumns.forEach((i) => {
				worksheet.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheet.addRows(result);

			//Pil Agama
			worksheetAgama.columns = [
				{ header: "KODE", key: "kode", width: 15 },
				{ header: "LABEL", key: "label", width: 15 }
			];
			const figureColumnsAgama = [1, 2];
			figureColumnsAgama.forEach((i) => {
				worksheetAgama.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetAgama.addRows([
				{ kode: 'Islam', label: 'Islam' },
				{ kode: 'Katolik', label: 'Katolik' },
				{ kode: 'Protestan', label: 'Protestan' },
				{ kode: 'Hindu', label: 'Hindu' },
				{ kode: 'Budha', label: 'Budha' }
			]);

			//Pil Pendidikan
			worksheetPendidikan.columns = [
				{ header: "KODE", key: "kode", width: 10 },
				{ header: "LABEL", key: "label", width: 50 }
			];
			const figureColumnsPendidikan = [1, 2];
			figureColumnsPendidikan.forEach((i) => {
				worksheetPendidikan.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetPendidikan.addRows([
				{ kode: '0', label: 'Tidak Berpendidikan Formal' },
				{ kode: '1', label: 'SD/Sederajat' },
				{ kode: '2', label: 'SMP/Sederajat' },
				{ kode: '3', label: 'SMA/Sederajat' },
				{ kode: '4', label: 'D1' },
				{ kode: '5', label: 'D2' },
				{ kode: '6', label: 'D3' },
				{ kode: '7', label: 'S1' },
				{ kode: '8', label: 'S2' },
				{ kode: '9', label: '>S2' },
			]);

			//Pil Jabatan
			worksheetJabatan.columns = [
				{ header: "KODE", key: "kode", width: 30 },
				{ header: "LABEL", key: "label", width: 30 }
			];
			const figureColumnsJabatan = [1, 2];
			figureColumnsJabatan.forEach((i) => {
				worksheetJabatan.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetJabatan.addRows([
				{ value: 'Kepala Sekolah', label: 'Kepala Sekolah' },
				{ value: 'WaKaBid. Kesiswaan', label: 'WaKaBid. Kesiswaan' },
				{ value: 'WaKaBid. Kurikulum', label: 'WaKaBid. Kurikulum' },
				{ value: 'WaKaBid. Sarpras', label: 'WaKaBid. Sarpras' },
				{ value: 'Kepala TU', label: 'Kepala TU' },
				{ value: 'Staff TU', label: 'Staff TU' },
				{ value: 'Wali Kelas', label: 'Wali Kelas' },
				{ value: 'BP / BK', label: 'BP / BK' },
				{ value: 'Pembina Osis', label: 'Pembina Osis' },
				{ value: 'Pembina Pramuka', label: 'Pembina Pramuka' },
				{ value: 'Pembina Paskibra', label: 'Pembina Paskibra' },
			]);

			//Pil Bidang Mengajar
			worksheetBidangMengajar.columns = [
				{ header: "KODE", key: "kode", width: 30 },
				{ header: "LABEL", key: "label", width: 30 }
			];
			const figureColumnsBidangworksheetBidangMengajar = [1, 2];
			figureColumnsBidangworksheetBidangMengajar.forEach((i) => {
				worksheetBidangMengajar.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheetBidangMengajar.addRows([
				{ kode: 'Alquran Hadits', label: 'Alquran Hadits' },
				{ kode: 'Aqidah Akhlak', label: 'Aqidah Akhlak' },
				{ kode: 'Bahasa Arab', label: 'Bahasa Arab' },
				{ kode: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
				{ kode: 'Bahasa Inggris', label: 'Bahasa Inggris' },
				{ kode: 'Bahasa Sunda', label: 'Bahasa Sunda' },
				{ kode: 'BTQ', label: 'BTQ' },
				{ kode: 'Fiqih', label: 'Fiqih' },
				{ kode: 'IPA Terpadu', label: 'IPA Terpadu' },
				{ kode: 'IPS Terpadu', label: 'IPS Terpadu' },
				{ kode: 'Matematika', label: 'Matematika' },
				{ kode: 'Penjasorkes', label: 'Penjasorkes' },
				{ kode: 'PKN', label: 'PKN' },
				{ kode: 'Prakarya', label: 'Prakarya' },
				{ kode: 'Seni Budaya', label: 'Seni Budaya' },
				{ kode: 'SKI', label: 'SKI' },
			]);

			res.setHeader(
				"Content-Disposition",
				"attachment; filename=TemplateDataGuru.xlsx"
			);
		}

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);
	
		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
    });	
}

const getKelas = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.kelas !== "ALL" ? data.kelas : '', (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const ambilKelas = (res, statementCheck, statementUserdDetails, statementCheckNilai, Insert, data) => {
    // jalankan query
    koneksi.query(statementCheck, data.id, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
			const kirimData = {
				kelas: data.kelas,
			}
			koneksi.query(statementUserdDetails, [kirimData, data.id], (err, result2, field) => {
				// error handling
				if (err) {
					return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
				}	
				koneksi.query(statementCheckNilai, data.id, (err, result, field) => {
					// error handling
					if (err) {
						return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
					}
					if(result.length){		
						koneksi.query(statementCheck, data.id, (err, dataterakhir, field) => {
							// error handling
							if (err) {
								return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
							}
							kode = 200
							message = 'Berhasil mengambil kelas'
							response(res, { kode, message, data: dataterakhir[0]}, 200);
						});
					}else{
						const mapel = ['Alquran Hadits', 'Aqidah Akhlak', 'Bahasa Arab', 'Bahasa Indonesia', 'Bahasa Inggris',
								'Bahasa Sunda', 'Fiqih', 'IPA Terpadu', 'IPS Terpadu', 'Matematika', 'Penjasorkes', 'PKN',
								'Prakarya', 'Seni Budaya', 'SKI']
						for(let i=0;i<mapel.length;i++){
							const simpanData = {
								id_profile: data.id,
								mapel: mapel[i]
							}
							koneksi.query(Insert, simpanData, (err, result2, field) => {
								// error handling
								if (err) {
									return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
								}
							});
						}
					}
				});
			});
        }else{
            return response(res, { kode: '404', message: 'Data tidak ditemukan' }, 404);
        }
    });
};

const detailUserPDF = (res, statementCheck, id) => {
    // jalankan query
    koneksi.query(statementCheck, id, async(err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		const optionsAgama = [
			{ value: 'Islam', label: 'Islam' },
			{ value: 'Katolik', label: 'Katolik' },
			{ value: 'Protestan', label: 'Protestan' },
			{ value: 'Hindu', label: 'Hindu' },
			{ value: 'Budha', label: 'Budha' },
		]
	
		const optionsHobi = [
			{ value: '1', label: 'Olahraga' },
			{ value: '2', label: 'Kesenian' },
			{ value: '3', label: 'Membaca' },
			{ value: '4', label: 'Menulis' },
			{ value: '5', label: 'Traveling' },
			{ value: '6', label: 'Lainnya' },
		]
		
		const optionsCitaCita = [
			{ value: '1', label: 'PNS' },
			{ value: '2', label: 'TNI/PORLI' },
			{ value: '3', label: 'Guru/Dosen' },
			{ value: '4', label: 'Dokter' },
			{ value: '5', label: 'Politikus' },
			{ value: '6', label: 'Wiraswasta' },
			{ value: '7', label: 'Pekerja Seni/Lukis/Artis/Sejenis' },
			{ value: '8', label: 'Lainnya' },
		]
		
		const optionsJenjang = [
			{ value: '1', label: 'MI' },
			{ value: '2', label: 'SD' },
			{ value: '3', label: 'SD Terbuka' },
			{ value: '4', label: 'SLB-MI' },
			{ value: '5', label: 'Paket A' },
			{ value: '6', label: 'Salafiyah Ula' },
			{ value: '7', label: 'MU`adalah MI' },
			{ value: '8', label: 'SLB-SD' },
			{ value: '9', label: 'Lainnya' },
		]
	
		const optionsStatusSekolah = [
			{ value: '1', label: 'Negeri' },
			{ value: '2', label: 'Swasta' },
		]
	
		const optionsStatusOrtu = [
			{ value: '1', label: 'Masih Hidup' },
			{ value: '2', label: 'Sudah Mati' },
			{ value: '3', label: 'Tidak Diketahui' },
		]
		
		const optionsPendidikan = [
			{ value: '0', label: 'Tidak Berpendidikan Formal' },
			{ value: '1', label: 'SD/Sederajat' },
			{ value: '2', label: 'SMP/Sederajat' },
			{ value: '3', label: 'SMA/Sederajat' },
			{ value: '4', label: 'D1' },
			{ value: '5', label: 'D2' },
			{ value: '6', label: 'D3' },
			{ value: '7', label: 'S1' },
			{ value: '8', label: 'S2' },
			{ value: '9', label: '>S2' },
		]
	
		const optionsPekerjaan = [
			{ value: '1', label: 'Tidak Bekerja' },
			{ value: '2', label: 'Pensiunan/Almarhum' },
			{ value: '3', label: 'PNS (selain Guru/Dosen/Dokter/Bidan/Perawat)' },
			{ value: '4', label: 'TNI/Polisi' },
			{ value: '5', label: 'Guru/Dosen' },
			{ value: '6', label: 'Pegawai Swasta' },
			{ value: '7', label: 'Pengusaha/Wiraswasta' },
			{ value: '8', label: 'Pengacara/Hakim/Jaksa/Notaris' },
			{ value: '9', label: 'Seniman/Pelukis/Artis/Sejenis' },
			{ value: '10', label: 'Dokter/Bidan/Perawat' },
			{ value: '11', label: 'Pilot/Pramugari' },
			{ value: '12', label: 'Pedagang' },
			{ value: '13', label: 'Petani/Peternak' },
			{ value: '14', label: 'Nelayan' },
			{ value: '15', label: 'Buruh (Tani/Pabrik/Bangunan)' },
			{ value: '16', label: 'Sopir/Masinis/Kondektur' },
			{ value: '17', label: 'Politikus' },
			{ value: '18', label: 'Lainnya' },
		]
	
		const optionsStatusTempatTinggal = [
			{ value: '1', label: 'Milik' },
			{ value: '2', label: 'Rumah Orangtua' },
			{ value: '3', label: 'Rumah Saudara/Kerabat' },
			{ value: '4', label: 'Rumah Dinas' },
		]
	
		const optionsJarakRumah = [
			{ value: '1', label: '< 1 Km' },
			{ value: '2', label: '1 - 3 Km' },
			{ value: '3', label: '3 - 5 Km' },
			{ value: '4', label: '5 - 10 Km' },
			{ value: '5', label: '> 10 Km' },
		]
	
		const optionsAlatTransportasi = [
			{ value: '1', label: 'Jalan Kaki' },
			{ value: '2', label: 'Sepeda' },
			{ value: '3', label: 'Sepeda Motor' },
			{ value: '4', label: 'Mobil Pribadi' },
			{ value: '5', label: 'Antar Jemput Sekolah' },
			{ value: '6', label: 'Angkutan Umum' },
			{ value: '7', label: 'Perahu/Sampan' },
			{ value: '8', label: 'Lainnya' },
		]
	
		const optionsPenghasilan = [
			{ value: '1', label: '<= Rp 500.000' },
			{ value: '2', label: 'Rp 500.001 - Rp 1.000.000' },
			{ value: '3', label: 'Rp 1.000.001 - Rp 2.000.000' },
			{ value: '4', label: 'Rp 2.000.001 - Rp 3.000.000' },
			{ value: '5', label: 'Rp 3.000.001 - Rp 5.000.000' },
			{ value: '6', label: '> Rp 5.000.000' },
		]

		const agama = optionsAgama.find(dataagama => dataagama.value === String(result[0].agama));
		const citacita = optionsCitaCita.find(datacitacita => datacitacita.value === String(result[0].cita_cita));
		const hobi = optionsHobi.find(datahobi => datahobi.value === String(result[0].hobi));
		const jenjangsekolah = optionsJenjang.find(datajenjang => datajenjang.value === String(result[0].jenjang));
		const statussekolah = optionsStatusSekolah.find(datastasek => datastasek.value === String(result[0].status_sekolah));
		const penghasilan = optionsPenghasilan.find(datapenghasilan => datapenghasilan.value === String(result[0].penghasilan));
		const statusayah = optionsStatusOrtu.find(datastatusayah => datastatusayah.value === String(result[0].status_ayah));
		const statusibu = optionsStatusOrtu.find(datastatusibu => datastatusibu.value === String(result[0].status_ibu));
		const pendidikanayah = optionsPendidikan.find(datapendidikanayah => datapendidikanayah.value === String(result[0].pendidikan_ayah));
		const pendidikanibu = optionsPendidikan.find(datapendidikanibu => datapendidikanibu.value === String(result[0].pendidikan_ibu));
		const pendidikanwali = optionsPendidikan.find(datapendidikanwali => datapendidikanwali.value === String(result[0].pendidikan_wali));
		const pekerjaanayah = optionsPekerjaan.find(datapekerjaanayah => datapekerjaanayah.value === String(result[0].pekerjaan_ayah));
		const pekerjaanibu = optionsPekerjaan.find(datapekerjaanibu => datapekerjaanibu.value === String(result[0].pekerjaan_ibu));
		const pekerjaanwali = optionsPekerjaan.find(datapekerjaanwali => datapekerjaanwali.value === String(result[0].pekerjaan_wali));
		const statustempattinggal = optionsStatusTempatTinggal.find(datastatustempattinggal => datastatustempattinggal.value === String(result[0].status_tempat_tinggal));
		const jarakrumah = optionsJarakRumah.find(datajarakrumah => datajarakrumah.value === String(result[0].jarak_rumah));
		const transportasi = optionsAlatTransportasi.find(datatransportasi => datatransportasi.value === String(result[0].transportasi));
		const hasil = {
			...result[0], 
			linkGatsa: "http://localhost:5000/bahan/gatsa.png",
			name: UpperFirstLetter(result[0].name),
			tempat: UpperFirstLetter(result[0].tempat),
			alamat: UpperFirstLetter(result[0].alamat),
			nama_sekolah: UpperFirstLetter(result[0].nama_sekolah),
			nama_kk: UpperFirstLetter(result[0].nama_kk),
			nama_ayah: UpperFirstLetter(result[0].nama_ayah),
			nama_ibu: UpperFirstLetter(result[0].nama_ibu),
			nama_wali: result[0].nama_wali ? UpperFirstLetter(result[0].nama_wali) : null,
			nama_provinsi: UpperFirstLetter(result[0].nama_provinsi), 
			nama_kabkota: UpperFirstLetter(result[0].nama_kabkota),
			nama_kabkot_sekolah: UpperFirstLetter(result[0].nama_kabkot_sekolah),
			nama_kecamatan: UpperFirstLetter(result[0].nama_kecamatan),
			nama_kelurahan: UpperFirstLetter(result[0].nama_kelurahan),
			tgl_lahir: dateconvert(result[0].tgl_lahir),
			agama: agama ? agama.label : '-',
			cita_cita: citacita ? citacita.label : '-',
			hobi: hobi ? hobi.label : '-',
			jenjang: jenjangsekolah ? jenjangsekolah.label : '-',
			jenjang: jenjangsekolah ? jenjangsekolah.label : '-',
			status_sekolah: statussekolah ? statussekolah.label : '-',
			penghasilan: penghasilan ? penghasilan.label : '-',
			status_ayah: statusayah ? statusayah.label : '-',
			status_ibu: statusibu ? statusibu.label : '-',
			pendidikan_ayah: pendidikanayah ? pendidikanayah.label : '-',
			pendidikan_ibu: pendidikanibu ? pendidikanibu.label : '-',
			pendidikan_wali: pendidikanwali ? pendidikanwali.label : '-',
			pekerjaan_ayah: pekerjaanayah ? pekerjaanayah.label : '-',
			pekerjaan_ibu: pekerjaanibu ? pekerjaanibu.label : '-',
			pekerjaan_wali: pekerjaanwali ? pekerjaanwali.label : '-',
			status_tempat_tinggal: statustempattinggal ? statustempattinggal.label : '-',
			jarak_rumah: jarakrumah ? jarakrumah.label : '-',
			transportasi: transportasi ? transportasi.label : '-',
		}
		// console.log(hasil)
		ejs.renderFile(path.join(__dirname, "../../views/viewSiswa.ejs"),{dataSiswa: hasil}, (err, data) => {
			if (err) {
				console.log(err)
			} else {
				// console.log(data)
				let options = {
					format: "A4",
					orientation: "portrait",
					quality: "10000",
					border: {
						top: "1.8cm",            // default is 0, units: mm, cm, in, px
						right: "2cm",
						bottom: "1.5cm",
						left: "2cm"
					},
					// header: {
					// 	height: "12mm",
					// },
					// footer: {
					// 	height: "15mm",
					// },
					httpHeaders: {
						"Content-type": "application/pdf",
					},
					type: "pdf",

				};
				pdf.create(data, options).toStream(function(err, stream){
					stream.pipe(res);
				});
			}
		});
    });
};

const kelasSiswa = (res, statementCheck, kelas) => {
    // jalankan query
    koneksi.query(statementCheck, kelas, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const penilaianSiswa = (res, statementCheck, data) => {
    // jalankan query
    koneksi.query(statementCheck, [data.mapel, data.kelas], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
};

const ubahPenilaian = (res, Update, data) => {
	let dataNilai = data.ubahNilai
	// jalankan query
	if(!data.triggerUbah) return response(res, { kode: '404', message: 'Anda belum memilih nilai yang ingin di ubah' }, 404);
	for(let i=0;i<dataNilai.length;i++){
		let simpanData
		if(data.triggerUbah == 'Tugas 1'){
			simpanData = { n_tugas1: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 2'){
			simpanData = { n_tugas2: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 3'){
			simpanData = { n_tugas3: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 4'){
			simpanData = { n_tugas4: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 5'){
			simpanData = { n_tugas5: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 6'){
			simpanData = { n_tugas6: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 7'){
			simpanData = { n_tugas7: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 8'){
			simpanData = { n_tugas8: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 9'){
			simpanData = { n_tugas9: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'Tugas 10'){
			simpanData = { n_tugas10: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'UTS'){
			simpanData = { n_uts: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}else if(data.triggerUbah == 'UAS'){
			simpanData = { n_uas: dataNilai[i].nilai ? dataNilai[i].nilai : null }
		}
		// console.log(simpanData, data.mapel, dataNilai[i].id_profile)
		koneksi.query(Update, [simpanData, dataNilai[i].id_profile, data.mapel], (err, result2, field) => {
			// error handling
			if (err) {
				return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
			}
		});
	}
	kode = 200
	message = 'Berhasil'
	response(res, { kode, message }, 200);
}

const jadwalNgajar = (res, statement, insert, data) => {
	koneksi.query(statement, [data.id, data.mapel, data.kelas], (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
        if(result.length){
			return response(res, { kode: '404', message: 'Data sudah ada' }, 404);
		}else{
			const kirimData = {
				id_profile: data.id,
				mapel: data.mapel,
				kelas: data.kelas,
				status: '1'
			}
			koneksi.query(insert, kirimData, (err, result, field) => {
				// error handling
				if (err) {
					return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
				}

				// jika request berhasil
				kode = 200
				message = 'Berhasil'
				response(res, { kode, message }, 200);
			});
		}
    });
}

const getjadwalNgajar = (res, statement, id_profile) => {
	koneksi.query(statement, id_profile, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }
		// jika request berhasil

		kode = 200
		message = 'Berhasil'
		response(res, { kode, message, data: result }, 200);
    });
}

const deletejadwalNgajar = (res, statement, id) => {
    // jalankan query
    koneksi.query(statement, id, (err, result, field) => {
        // error handling
        if (err) {
            return response(res, { kode: '500', message: 'Terjadi kesalahan pada sistem kami, hubungin admin untuk tindak lanjut penyelesaiannya', error: err }, 500);
        }

		// jika request berhasil
		kode = 200
		message = 'Berhasil'
		response(res, { kode, message }, 200);
    });
};

module.exports = {
    dataDashboard,
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
    updateBerkas,
    downloadexcel,
    importData,
    exportexcel,
    getKelas,
    ambilKelas,
    detailUserPDF,
    kelasSiswa,
    penilaianSiswa,
    ubahPenilaian,
    jadwalNgajar,
    getjadwalNgajar,
    deletejadwalNgajar,
}