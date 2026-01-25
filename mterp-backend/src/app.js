const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// --- Middleware Global ---
app.use(cors());
app.use(express.json());

// Akses Folder Upload (Static)
// __dirname menunjuk ke folder src, jadi naik satu level ke root lalu ke uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Routing ---
app.get('/', (req, res) => {
    res.send('✅ Server MTERP Mobile Berjalan Normal (Modular Version)!');
});

// Daftarkan URL API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/attendance', attendanceRoutes);
// Note: Route inventory mencakup tools dan inventory
app.use('/api/inventory', inventoryRoutes); // Untuk GET /api/inventory
app.use('/api/tools', inventoryRoutes);     // Untuk /api/tools/request, dll (Pakai route file yang sama tidak masalah)
app.use('/api/requests', requestRoutes);

module.exports = app;
