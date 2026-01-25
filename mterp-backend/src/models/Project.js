const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // --- Informasi Utama ---
    nama: { type: String, required: true },
    lokasi: { type: String, required: true },
    description: String,
    status: { type: String, default: 'Planning' }, 
    progress: { type: Number, default: 0 }, // Global Actual Progress %
    totalBudget: { type: Number, default: 0 }, // Total Budget (Rv)
    
    // --- Dates ---
    globalDates: {
        planned: {
            start: Date,
            end: Date
        },
        actual: {
            start: Date,
            end: Date
        }
    },
    startDate: Date, // Keep for backward compatibility/sorting if needed
    endDate: Date,   // Keep for backward compatibility/sorting if needed
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // --- Supply Planning (Material/Logistik Awal) ---
    supplies: [{
        id: String,
        item: String,
        cost: Number,
        staffAssigned: String,
        deadline: String, // YYYY-MM-DD
        status: { type: String, default: 'Pending' },
        actualPurchaseDate: Date,
        actualCost: Number
    }],

    // --- Item Pekerjaan (Detail Schedule & Cost) ---
    workItems: [{ 
        id: Number, 
        name: String, 
        qty: Number,
        volume: String, // e.g. "m3", "unit"
        cost: Number,   // Total Rupiah Cost for this item
        weight: Number, // Percentage weight (Cost / TotalBudget * 100)
        
        logic: { type: String, enum: ['Flexible', 'Semi-flexible', 'Inflexible'], default: 'Flexible' },
        
        dates: {
            plannedStart: String, // YYYY-MM-DD
            plannedEnd: String,
            actualStart: String,
            actualEnd: String
        },

        // Resource Allocation Plan
        resources: [{
            name: String,
            type: { type: String, enum: ['Material', 'Manpower', 'Tool'] },
            cost: Number,
            unit: String,
            qty: Number
        }],

        // Execution Actuals
        actuals: {
            progressPercent: { type: Number, default: 0 },
            costUsed: { type: Number, default: 0 },
            resourcesUsed: [] // Array of resources actually consumed
        }
    }],
    
    // --- Dokumen ---
    documents: {
        shopDrawing: String, // URI / Path
        hse: String,
        manPowerList: String,
        workItemsList: String,
        materialList: String,
        toolsList: String,
        
        // Legacy keys (optional keep)
        perencanaan: String,
        rab: String,
        gambarKerja: String,
        rencanaMaterial: String,
        rencanaAlat: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
