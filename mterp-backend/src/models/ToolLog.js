const mongoose = require('mongoose');
const toolLogSchema = new mongoose.Schema({
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['borrow', 'return'] },
    kondisi: String,
    tanggal: { type: Date, default: Date.now },
    lokasiProject: String
});
module.exports = mongoose.model('ToolLog', toolLogSchema);
