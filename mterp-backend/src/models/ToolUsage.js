const mongoose = require('mongoose');

const toolUsageSchema = new mongoose.Schema({
    projectToolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProjectTool', 
        required: true 
    },
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    usedByWorker: { type: String, required: true }, // Nama pemakai (Req 2)
    workItem: { type: String, required: true },     // Untuk pekerjaan apa (Req 2)
    taggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin yang ngetag
    date: { type: Date, default: Date.now },
    notes: String
});

module.exports = mongoose.model('ToolUsage', toolUsageSchema);
