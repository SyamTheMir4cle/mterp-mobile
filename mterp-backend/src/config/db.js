const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mterp_db';
        await mongoose.connect(uri);
        console.log('✅ Database MongoDB Terhubung');
    } catch (err) {
        console.error('❌ Gagal Koneksi Database:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
