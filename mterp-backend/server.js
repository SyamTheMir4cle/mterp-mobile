require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_laptop_123';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SETUP EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS
  }
});

// --- SCHEMA USER (UPDATED) ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // <--- Email Wajib
  password: { type: String, required: true },
  fullName: String,
  role: { 
    type: String, 
    enum: ['owner', 'director', 'asset_admin', 'supervisor', 'worker'], 
    default: 'worker' 
  },
  assignedProject: String,
  // Kolom Verifikasi
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date
});
const User = mongoose.model('User', userSchema);

// Pastikan folder upload ada
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// KONEKSI DATABASE (Ini yang bikin error kalau MongoDB belum diinstall)
mongoose.connect('mongodb://localhost:27017/mterp_db')
  .then(() => console.log('✅ Database Terhubung'))
  .catch(err => console.error('❌ Gagal Konek Database. Pastikan MongoDB sudah diinstall!', err));

// --- SCHEMA ABSENSI ---
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jamMasuk: String,
  foto: String,
  tanggal: { type: Date, default: Date.now }
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// --- ROUTE LOGIN ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(400).json({ msg: 'User tidak ditemukan' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Password salah' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, role: user.role, fullName: user.fullName });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- ROUTE ABSENSI (Upload Foto) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '.jpg')
});
const upload = multer({ storage });

// Perbaikan Middleware Auth Sederhana
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({msg: "No Token"});
    try {
        const bearer = token.split(" ")[1];
        const decoded = jwt.verify(bearer, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) { res.status(401).json({msg: "Token Invalid"}); }
};

app.post('/api/attendance', verifyToken, upload.single('foto'), async (req, res) => {
    try {
        const absen = await Attendance.create({
            userId: req.user.id,
            jamMasuk: req.body.jamMasuk,
            foto: req.file ? `/uploads/${req.file.filename}` : null
        });
        console.log("Absen Masuk:", req.user.id);
        res.json(absen);
    } catch (e) { res.status(500).json({error: e.message}); }
});

// --- ROUTE REGISTER BARU (Kirim OTP) ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, fullName, role, assignedProject } = req.body;
  
  try {
    // 1. Cek duplikat
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ msg: 'Username atau Email sudah terpakai' });

    // 2. Generate OTP 6 Digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // Kadaluarsa 10 menit

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan User (Status belum verifikasi)
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      assignedProject,
      isVerified: false,
      otp,
      otpExpires
    });

    // 5. Kirim Email
    const mailOptions = {
      from: `"MTERP System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Verifikasi Akun MTERP Anda',
      text: `Halo ${fullName},\n\nKode verifikasi pendaftaran Anda adalah: ${otp}\n\nKode ini berlaku selama 10 menit.\nJangan berikan kode ini kepada siapapun.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: 'Registrasi berhasil. Silakan cek email untuk kode OTP.', email: email });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal registrasi atau kirim email' });
  }
});

// --- ROUTE VERIFIKASI OTP ---
app.post('/api/auth/verify', async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ msg: 'User tidak ditemukan' });
    if (user.isVerified) return res.status(400).json({ msg: 'Akun sudah terverifikasi sebelumnya' });

    // Cek OTP dan Kadaluarsa
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Kode OTP salah atau sudah kadaluarsa' });
    }

    // Aktifkan User
    user.isVerified = true;
    user.otp = undefined; // Hapus OTP biar bersih
    user.otpExpires = undefined;
    await user.save();

    res.json({ msg: 'Akun berhasil diverifikasi! Silakan login.' });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ROUTE LOGIN (Cek Verifikasi) ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ msg: 'Username/Password Salah' });
  }

  // PENTING: Cek apakah sudah verifikasi email?
  if (!user.isVerified) {
    return res.status(403).json({ msg: 'Akun belum diverifikasi. Cek email Anda.' });
  }

  const token = jwt.sign({ id: user._id, role: user.role, fullName: user.fullName }, JWT_SECRET);
  res.json({ token, role: user.role, fullName: user.fullName });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Siap di Port ${PORT}`);
});