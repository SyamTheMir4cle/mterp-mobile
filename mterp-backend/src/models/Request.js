const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema({
    jenis: { type: String, enum: ['material', 'kasbon'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Link to Project
    
    // Details
    item: String,         // Nama Barang
    qty: String,          // Jumlah + Satuan
    dateNeeded: String,   // Tanggal Dibutuhkan
    costEstimate: Number, // Estimasi Biaya
    
    detail: String,       // Keterangan Tambahan / Alasan
    purpose: String,      // Tujuan penggunaan material
    jumlah: Number,       // Nominal (utk Kasbon)
    
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tanggal: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Request', requestSchema);
