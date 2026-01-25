const Attendance = require('../models/Attendance');

// 1. Absen Masuk (dengan upload foto)
exports.clockIn = async (req, res) => {
    try {
        const absen = await Attendance.create({
            userId: req.user.id,
            jamMasuk: req.body.jamMasuk,
            projectId: req.body.projectId,
            foto: req.file ? `/uploads/${req.file.filename}` : null
        });
        res.json({ msg: 'Absen Berhasil', data: absen });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 2. Lihat Log Absensi
exports.getLogs = async (req, res) => {
    try {
        const logs = await Attendance.find()
            .populate('userId', 'fullName role')
            .sort({ tanggal: -1 });
        res.json(logs);
    } catch (e) { res.status(500).json({ error: e.message }); }
};
