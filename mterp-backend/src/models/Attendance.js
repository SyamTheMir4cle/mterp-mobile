const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jamMasuk: String,
    foto: String, // Path file gambar
    projectId: String,
    wageMultiplier: { type: Number, default: 1.0 }, // 1.0 = Full Day, 0.5 = Half Day
    tanggal: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
