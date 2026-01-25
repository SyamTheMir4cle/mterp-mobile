const mongoose = require('mongoose');

const projectToolSchema = new mongoose.Schema({
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    toolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Inventory', 
        required: true 
    },
    quantity: { type: Number, required: true, default: 1 },
    notes: { type: String }, // Custom notes (Req 1: Optional notes)
    status: { 
        type: String, 
        enum: ['Active', 'Broken', 'Lost', 'Returned'], 
        default: 'Active' 
    },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectTool', projectToolSchema);
