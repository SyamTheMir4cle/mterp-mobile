require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'rahasia_laptop_123'; 

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pastikan folder upload ada
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// KONEKSI DATABASE (Ini yang bikin error kalau MongoDB belum diinstall)
mongoose.connect('mongodb://localhost:27017/mterp_db')
  .then(() => console.log('✅ Database Terhubung'))
  .catch(err => console.error('❌ Gagal Konek Database. Pastikan MongoDB sudah diinstall!', err));

// --- SCHEMA USER ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  role: { type: String, default: 'tukang' }
});
const User = mongoose.model('User', userSchema);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Siap di Port ${PORT}`);
});