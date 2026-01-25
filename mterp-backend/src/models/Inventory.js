const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    nama: { type: String, required: true },
    kategori: { type: String, enum: ['alat', 'material'], required: true },
    stok: { type: Number, default: 0 }, // Stok yang tersedia di GUDANG UTAMA
    satuan: String,
    kondisi: { type: String, default: 'Bagus' },
    lokasi: { type: String, default: 'Gudang Utama' } // Default location
});

module.exports = mongoose.model('Inventory', inventorySchema);
