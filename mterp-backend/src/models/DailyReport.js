const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    date: { type: Date, default: Date.now },
    
    // Basic Info
    weather: String,        // Cerah, Hujan, Berawan
    toolboxMeeting: String, // Notes or "Yes/No"

    // Data Progress Item
    workProgress: [{
        id: Number,
        name: String,
        currentProgress: Number, // % Complete this day
        actualCostToday: Number, // Biaya yg keluar hari ini utk item ini
        notes: String
    }],
    
    // Data Tenaga Kerja
    workforce: [{
        role: String,
        count: Number
    }],
    
    // Material & Alat
    resources: [{
        item: String,
        qty: Number,
        unit: String,
        category: { type: String, enum: ['Material', 'Tool', 'Fuel'] }
    }],
    
    // Foto
    foto: String,
    
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
