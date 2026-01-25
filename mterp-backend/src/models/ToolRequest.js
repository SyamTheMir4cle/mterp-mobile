const mongoose = require('mongoose');
const toolRequestSchema = new mongoose.Schema({
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned'], default: 'pending' },
    requestDate: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalDate: Date
});
module.exports = mongoose.model('ToolRequest', toolRequestSchema);
