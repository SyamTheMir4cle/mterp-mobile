require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Jalankan Koneksi Database Dulu, Baru Server
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`=================================`);
        console.log(`🚀 Server ERP Berjalan di Port ${PORT}`);
        console.log(`📝 Mode: Modular (MVC Architecture)`);
        console.log(`=================================`);
    });
});
