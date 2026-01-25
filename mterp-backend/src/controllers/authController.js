const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_mterp_2025';

// 1. Register
exports.register = async (req, res) => {
    const { username, email, password, fullName, role, assignedProject } = req.body;
    try {
        const exist = await User.findOne({ $or: [{ email }, { username }] });
        if (exist) return res.status(400).json({ msg: 'Username atau Email sudah dipakai' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const newUser = await User.create({
            username, email, password: hashedPassword, fullName, role, assignedProject,
            isVerified: false, otp, otpExpires
        });

        if (process.env.SMTP_EMAIL && process.env.SMTP_PASS) {
            await transporter.sendMail({
                from: `"MTERP System" <${process.env.SMTP_EMAIL}>`,
                to: email,
                subject: 'Kode Verifikasi MTERP',
                text: `Kode OTP Anda: ${otp}`
            });
            res.json({ msg: 'Register sukses. Cek email untuk OTP.', userId: newUser._id });
        } else {
            res.json({ msg: 'Register sukses. SMTP belum aktif, OTP: ' + otp });
        }
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
};

// 2. Verifikasi OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User tidak ditemukan' });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP Salah atau Kadaluarsa' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ msg: 'Akun Aktif! Silakan Login.' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. Login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'User tidak ditemukan' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Password Salah' });

        const token = jwt.sign({ id: user._id, role: user.role, fullName: user.fullName }, JWT_SECRET);
        res.json({ token, role: user.role, fullName: user.fullName });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
