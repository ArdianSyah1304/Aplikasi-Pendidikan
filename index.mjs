import express from "express";

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ================= DATA STORAGE & CONFIG ================= */
let config = {
    namaLembaga: "MA NURUL MUJAHIDAH NW TANJUNG SELOR",
    warnaUtama: "#27ae60",
    warnaLogin: "#00c3ff",
    fontSize: "14px",
    borderRadius: "12px",
    sidebarPos: "left"
};

let USERS = [
    { id: 1, username: "admin", password: "123", nama: "Administrator", role: "admin" },
    { id: 2, username: "user", password: "123", nama: "Siswa Tamu", role: "mahasiswa" }
];

let db = {
    siswa: [{ id: "001", nama: "Budi Utomo", ttl: "Jakarta, 01-01-2008", jk: "Laki-laki", alamat: "Tanjung Selor", hp: "0812...", email: "budi@mail.com" }],
    guru: [{ id: "G01", nama: "H. Ahmad", ttl: "Sumbawa, 12-05-1980", jk: "Laki-laki", alamat: "Jl. Pahlawan", hp: "0852...", email: "ahmad@mail.com" }],
    administrasi: [
        { id: "T01", nama: "Budi Utomo", jenis: "SPP Januari", total: "250000", metode: "DANA" },
        { id: "T02", nama: "Siswa X", jenis: "Uang Buku", total: "150000", metode: "Cash" }
    ],
    fasilitas: [{ id: "F01", nama: "Lab Komputer", kondisi: "Baik", jumlah: "25" }],
    mapel: [{ id: "M01", nama: "Fisika", guru: "H. Ahmad", hari: "Senin", mulai: "08:00", selesai: "10:00" }],
    pengumuman: [{ id: "P01", judul: "Libur Semester", tanggal: "2026-06-20", isi: "Libur dimulai minggu depan." }],
    notifikasi: [{ id: "N01", nama: "Budi Utomo", perihal: "Beasiswa Prestasi", tanggal: "2026-01-14", isi: "Selamat anda mendapatkan beasiswa semester ini." }]
};

let sessionUser = null;

/* ================= MIDDLEWARE ================= */
const auth = (req, res, next) => {
    if (sessionUser) next();
    else res.redirect("/login");
};

const isAdmin = (req, res, next) => {
    if (sessionUser && sessionUser.role === 'admin') next();
    else res.send("<script>alert('Akses Ditolak!'); window.history.back();</script>");
};

/* ================= ROUTES LOGIN ================= */

app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
    res.send(`
    <!DOCTYPE html><html><head><title>Login SISFO</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background: #f0f2f5; display:flex; height:100vh; font-family:sans-serif; margin:0; align-items:center; justify-content:center; }
        .login-card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 350px; text-align: center; }
        .user-icon { width: 80px; height: 80px; border: 2px solid #5d6d7e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .user-icon i { font-size: 40px; color: #5d6d7e; }
        h1 { color: #5d6d7e; letter-spacing: 5px; font-weight: 300; margin-bottom: 30px; font-size: 28px; }
        .input-box { border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; margin-bottom: 15px; padding: 12px; }
        .input-box i { color: #5d6d7e; width: 30px; border-right: 1px solid #ddd; margin-right: 10px; }
        input { border: none; outline: none; width: 100%; font-size: 16px; }
        .btn-login { width: 100%; padding: 12px; background: ${config.warnaLogin}; border: none; border-radius: 8px; color: white; font-size: 16px; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .btn-login:hover { opacity: 0.8; }
        .footer-links { margin-top: 20px; font-size: 13px; color: #7f8c8d; }
        a { color: ${config.warnaLogin}; text-decoration: none; }
    </style></head>
    <body>
        <div class="login-card">
            <div class="user-icon"><i class="fa fa-user"></i></div>
            <h1>LOGIN</h1>
            <form action="/login" method="POST">
                <div class="input-box"><i class="fa fa-user"></i><input name="username" placeholder="Username" required></div>
                <div class="input-box"><i class="fa fa-lock"></i><input name="password" type="password" placeholder="********" required></div>
                <button class="btn-login">LOGIN</button>
            </form>
            <div class="footer-links">Forgot Your Password? <a href="#">Click here</a></div>
        </div>
    </body></html>`);
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) { sessionUser = user; res.redirect("/dashboard"); }
    else { res.send("<script>alert('Gagal Login!'); window.location.href='/login';</script>"); }
});

app.get("/logout", (req, res) => { sessionUser = null; res.redirect("/login"); });

/* ================= MAIN ENGINE ================= */

function renderLayout(content, active) {
    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: 'th-large', link: '/dashboard' },
        { id: 'siswa', label: 'Data Siswa', icon: 'users', link: '/menu/siswa' },
        { id: 'guru', label: 'Data Guru', icon: 'user-tie', link: '/menu/guru' },
        { id: 'mapel', label: 'Mata Pelajaran', icon: 'book', link: '/menu/mapel' },
        { id: 'administrasi', label: 'Administrasi', icon: 'file-invoice-dollar', link: '/menu/administrasi' },
        { id: 'fasilitas', label: 'Sarana/Aset', icon: 'building', link: '/menu/fasilitas' },
        { id: 'pengumuman', label: 'Pengumuman', icon: 'bullhorn', link: '/menu/pengumuman' },
        { id: 'notifikasi', label: 'Notifikasi', icon: 'bell', link: '/menu/notifikasi' },
    ];

    if(sessionUser.role === 'admin') {
        menu.push({ id: 'pengaturan', label: 'Pengaturan', icon: 'cog', link: '/pengaturan' });
    }

    return `
    <!DOCTYPE html><html><head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root { --main: ${config.warnaUtama}; --bg: #f4f7f6; --radius: ${config.borderRadius}; }
        body { margin:0; display:flex; flex-direction: ${config.sidebarPos === 'right' ? 'row-reverse' : 'row'}; font-family: 'Segoe UI', sans-serif; background:var(--bg); font-size: ${config.fontSize}; }
        .sidebar { width:260px; background:#2c3e50; min-height:100vh; color:white; position: sticky; top: 0; height: 100vh; }
        .brand { background: var(--main); padding:20px; font-weight:bold; text-align:center; font-size: 18px; }
        .user-box { padding:20px; text-align:center; border-bottom:1px solid #3e4f5f; }
        .user-box img { width:60px; height:60px; border-radius:50%; margin-bottom:10px; border: 2px solid #fff; }
        .menu-list a { padding:12px 20px; display:block; color:#bdc3c7; text-decoration:none; transition:0.3s; border-left: 4px solid transparent; }
        .menu-list a:hover, .menu-list a.active { background:#1a252f; color:white; border-left-color: var(--main); }
        .main { flex:1; padding: 25px; overflow-x: hidden; }
        .header { background:white; padding:15px 30px; display:flex; justify-content:space-between; align-items:center; border-radius:var(--radius); box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:20px; }
        .card { background:white; padding:20px; border-radius:var(--radius); box-shadow:0 4px 15px rgba(0,0,0,0.05); margin-bottom:20px; border-top: 3px solid var(--main); position: relative; }
        .grid-6 { display:grid; grid-template-columns: repeat(6, 1fr); gap:15px; margin-bottom: 20px; }
        .stat-card { padding: 20px; color: white; border-radius: var(--radius); text-align:center; }
        .stat-card h2 { margin: 5px 0 0 0; font-size: 30px; }
        
        table { width:100%; border-collapse:collapse; }
        th { text-align:left; padding: 12px; background: #f8f9fa; border-bottom: 2px solid var(--main); }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .btn { padding: 8px 15px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; }
        .btn-add { background: var(--main); color: white; margin-bottom: 15px; }
        .btn-edit { background: #f39c12; color: white; }
        .btn-del { background: #e74c3c; color: white; }
        .btn-print { background: #34495e; color: white; }
        .btn-qr { background: #00c3ff; color: white; cursor: pointer; }

        .form-popup { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 450px; background: white; z-index: 1000; padding: 25px; border-radius: var(--radius); box-shadow: 0 0 100px rgba(0,0,0,0.5); }
        .overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 999; }
        .form-group { margin-bottom: 12px; }
        .form-group label { display: block; margin-bottom: 4px; font-weight: bold; font-size: 12px; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        .qr-modal { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:20px; z-index:1001; text-align:center; border-radius:15px; }
    </style></head>
    <body>
        <div class="overlay" id="overlay" onclick="closeForm(); closeQR()"></div>
        <div class="qr-modal" id="qr-modal">
            <h3>SCAN PEMBAYARAN</h3>
            <div id="qr-img"></div>
            <p id="qr-text" style="font-weight:bold"></p>
            <button class="btn btn-del" onclick="closeQR()">TUTUP</button>
        </div>
        <div class="sidebar">
            <div class="brand">SISFO AKADEMIK</div>
            <div class="user-box">
                <img src="https://ui-avatars.com/api/?name=${sessionUser.nama}&background=random">
                <div><b>${sessionUser.nama}</b><br><small>${sessionUser.role.toUpperCase()}</small></div>
            </div>
            <div class="menu-list">
                ${menu.map(m => `<a href="${m.link}" class="${active===m.id?'active':''}"><i class="fa fa-${m.icon}"></i> &nbsp; ${m.label}</a>`).join('')}
                <a href="/logout" style="color:#e74c3c; border:none; margin-top:20px"><i class="fa fa-sign-out-alt"></i> Keluar</a>
            </div>
        </div>
        <div class="main">
            <div class="header">
                <span style="color:var(--main); font-weight:bold"><i class="fa fa-university"></i> ${config.namaLembaga}</span>
                <span id="clock" style="color:#7f8c8d"></span>
            </div>
            ${content}
        </div>
        <script>
            function tick() { document.getElementById('clock').innerHTML = new Date().toLocaleString('id-ID'); }
            setInterval(tick, 1000); tick();
            function openForm() { document.getElementById('form-popup').style.display = 'block'; document.getElementById('overlay').style.display = 'block'; }
            function closeForm() { document.getElementById('form-popup').style.display = 'none'; document.getElementById('overlay').style.display = 'none'; document.getElementById('main-form').reset(); document.getElementById('form-index').value = "-1"; }
            function editData(item, idx) { openForm(); document.getElementById('form-index').value = idx; for(let key in item) { const el = document.getElementById('inp-' + key); if(el) el.value = item[key]; } }
            function showQR(metode, total) {
                document.getElementById('qr-modal').style.display = 'block';
                document.getElementById('overlay').style.display = 'block';
                document.getElementById('qr-text').innerText = metode + " - Rp " + total;
                document.getElementById('qr-img').innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BAYAR_'+metode+'_'+total+'" />';
            }
            function closeQR() { document.getElementById('qr-modal').style.display = 'none'; document.getElementById('overlay').style.display = 'none'; }
        </script>
    </body></html>`;
}

/* ================= PAGES ================= */

app.get("/dashboard", auth, (req, res) => {
    const counts = [db.siswa.length, db.guru.length, db.administrasi.length, db.mapel.length, db.fasilitas.length, db.pengumuman.length];
    let content = `
    <div class="grid-6">
        <div class="stat-card" style="background:#1abc9c">SISWA<h2>${counts[0]}</h2></div>
        <div class="stat-card" style="background:#3498db">GURU<h2>${counts[1]}</h2></div>
        <div class="stat-card" style="background:#f1c40f">ADM<h2>${counts[2]}</h2></div>
        <div class="stat-card" style="background:#9b59b6">MAPEL<h2>${counts[3]}</h2></div>
        <div class="stat-card" style="background:#e67e22">ASET<h2>${counts[4]}</h2></div>
        <div class="stat-card" style="background:#e74c3c">PERPUS<h2>${counts[5]}</h2></div>
    </div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px">
        <div class="card"><h4>Bar Chart (Data Utama)</h4><canvas id="c1"></canvas></div>
        <div class="card"><h4>Pie Chart (Distribusi)</h4><canvas id="c2"></canvas></div>
        <div class="card"><h4>Line Chart (Tren)</h4><canvas id="c3"></canvas></div>
        <div class="card"><h4>Doughnut Chart</h4><canvas id="c4"></canvas></div>
        <div class="card"><h4>Polar Area</h4><canvas id="c5"></canvas></div>
        <div class="card"><h4>Radar Chart</h4><canvas id="c6"></canvas></div>
    </div>
    <script>
        const ctxs = ['c1','c2','c3','c4','c5','c6'], types = ['bar','pie','line','doughnut','polarArea','radar'], colors = ['#1abc9c','#3498db','#f1c40f','#9b59b6','#e67e22','#e74c3c'];
        ctxs.forEach((id, i) => {
            new Chart(document.getElementById(id), {
                type: types[i],
                data: {
                    labels: ['Siswa', 'Guru', 'Adm', 'Mapel', 'Sarana', 'Perpus'],
                    datasets: [{ label: 'Jumlah', data: [${counts}], backgroundColor: colors }]
                },
                options: { responsive: true, plugins: { legend: { display: i !== 0 } } }
            });
        });
    </script>`;
    res.send(renderLayout(content, 'dashboard'));
});

app.get("/menu/:fitur", auth, (req, res) => {
    const { fitur } = req.params;
    const data = db[fitur] || [];
    const isAdminUser = sessionUser.role === 'admin';
    let headers = Object.keys(data[0] || { id: "", nama: "" });
    
    let html = `
    <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px">
            <h3 style="margin:0">Manajemen ${fitur.toUpperCase()}</h3>
            ${isAdminUser ? `<button class="btn btn-add" onclick="openForm()"><i class="fa fa-plus"></i> Tambah Data</button>` : ""}
        </div>
        
        <div class="form-popup" id="form-popup">
            <h3 style="margin-top:0">Input Data ${fitur}</h3>
            <form action="/action/${fitur}" method="POST" id="main-form">
                <input type="hidden" name="index" id="form-index" value="-1">
                ${headers.map(k => `
                    <div class="form-group">
                        <label>${k.toUpperCase()}</label>
                        ${k === 'jk' ? `<select name="jk" id="inp-jk"><option>Laki-laki</option><option>Perempuan</option></select>` :
                          k === 'metode' ? `<select name="metode" id="inp-metode"><option>Cash</option><option>DANA</option><option>OVO</option><option>GOPAY</option></select>` :
                          k === 'isi' ? `<textarea name="isi" id="inp-isi"></textarea>` :
                          `<input name="${k}" id="inp-${k}" required>`}
                    </div>
                `).join('')}
                <button class="btn btn-add" style="width:100%; margin: 10px 0">SIMPAN DATA</button>
                <button type="button" class="btn btn-del" style="width:100%" onclick="closeForm()">BATAL</button>
            </form>
        </div>

        <table>
            <thead><tr>${headers.map(h => `<th>${h.toUpperCase()}</th>`).join('')}<th>AKSI</th></tr></thead>
            <tbody>
                ${data.map((item, idx) => `
                    <tr>
                        ${Object.values(item).map(v => `<td>${v}</td>`).join('')}
                        <td>
                            ${isAdminUser ? `
                                <button class="btn btn-edit" onclick='editData(${JSON.stringify(item)}, ${idx})'><i class="fa fa-edit"></i></button>
                                <a href="/delete/${fitur}/${idx}" class="btn btn-del" onclick="return confirm('Hapus?')"><i class="fa fa-trash"></i></a>
                            ` : ""}
                            ${fitur === 'administrasi' && item.metode !== 'Cash' ? `<button class="btn btn-qr" onclick="showQR('${item.metode}', '${item.total}')"><i class="fa fa-qrcode"></i> QR</button>` : ""}
                            ${fitur === 'notifikasi' ? `<a href="/cetak/${idx}" target="_blank" class="btn btn-print"><i class="fa fa-print"></i></a>` : ""}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;

    if (fitur === 'pengumuman' && !isAdminUser) {
        html += `<div class="card"><h3>📅 Kalender Pengumuman</h3><div style="background:#f9f9f9; padding:30px; border-radius:10px; border:1px dashed #ccc">${db.pengumuman.map(p => `<b>${p.tanggal}</b>: ${p.judul}<br>`).join('')}</div></div>`;
    }
    if (fitur === 'mapel' && !isAdminUser) {
        html += `<div class="card"><h3>📖 Jadwal Pelajaran Saya</h3><p>Silahkan cek kolom HARI dan JAM pada tabel diatas.</p></div>`;
    }

    res.send(renderLayout(html, fitur));
});

/* ================= ACTIONS ================= */

app.post("/action/:fitur", isAdmin, (req, res) => {
    const { index, ...payload } = req.body;
    if (index === "-1") db[req.params.fitur].push(payload);
    else db[req.params.fitur][index] = payload;
    res.redirect(`/menu/${req.params.fitur}`);
});

app.get("/delete/:fitur/:idx", isAdmin, (req, res) => {
    db[req.params.fitur].splice(req.params.idx, 1);
    res.redirect(`/menu/${req.params.fitur}`);
});

app.get("/cetak/:idx", auth, (req, res) => {
    const data = db.notifikasi[req.params.idx];
    res.send(`<body onload="window.print()" style="font-family:serif; padding:50px"><center><h2>${config.namaLembaga}</h2><hr></center>
    <p style="text-align:right">${data.tanggal}</p><p>Perihal: ${data.perihal}</p><p>Kepada: ${data.nama}</p>
    <p style="margin:50px 0">${data.isi}</p><div style="float:right; text-align:center">Kepala Sekolah<br><br><br><br>( ................. )</div></body>`);
});

app.get("/pengaturan", isAdmin, (req, res) => {
    let html = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px">
        <div class="card">
            <h3>🎨 Kustomisasi Tampilan</h3>
            <form action="/update-config" method="POST">
                <div class="form-group"><label>Nama Lembaga</label><input name="namaLembaga" value="${config.namaLembaga}"></div>
                <div class="form-group"><label>Warna Utama</label><input name="warnaUtama" type="color" value="${config.warnaUtama}"></div>
                <div class="form-group"><label>Warna Login</label><input name="warnaLogin" type="color" value="${config.warnaLogin}"></div>
                <div class="form-group"><label>Posisi Sidebar</label><select name="sidebarPos"><option value="left" ${config.sidebarPos==='left'?'selected':''}>Kiri</option><option value="right" ${config.sidebarPos==='right'?'selected':''}>Kanan</option></select></div>
                <div class="form-group"><label>Gaya Sudut</label><select name="borderRadius"><option value="0px" ${config.borderRadius==='0px'?'selected':''}>Kotak</option><option value="12px" ${config.borderRadius==='12px'?'selected':''}>Rounded</option><option value="30px" ${config.borderRadius==='30px'?'selected':''}>Extra Round</option></select></div>
                <button class="btn btn-add" style="width:100%">SIMPAN PERUBAHAN</button>
            </form>
        </div>
        <div class="card">
            <h3>🔐 Keamanan Akun</h3>
            <form action="/update-auth" method="POST">
                <div class="form-group"><label>User Admin</label><input name="u_admin" value="${USERS[0].username}"></div>
                <div class="form-group"><label>Pass Admin</label><input name="p_admin" value="${USERS[0].password}"></div>
                <div class="form-group"><label>User Siswa</label><input name="u_user" value="${USERS[1].username}"></div>
                <div class="form-group"><label>Pass Siswa</label><input name="p_user" value="${USERS[1].password}"></div>
                <button class="btn btn-del" style="width:100%">UPDATE AKSES</button>
            </form>
        </div>
    </div>`;
    res.send(renderLayout(html, 'pengaturan'));
});

app.post("/update-config", isAdmin, (req, res) => { config = { ...config, ...req.body }; res.redirect("/pengaturan"); });
app.post("/update-auth", isAdmin, (req, res) => { USERS[0].username = req.body.u_admin; USERS[0].password = req.body.p_admin; USERS[1].username = req.body.u_user; USERS[1].password = req.body.p_user; res.send("<script>alert('Berhasil!'); window.location.href='/pengaturan';</script>"); });

app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
