require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mterp_db')
  .then(() => console.log('✅ Database Terhubung'))
  .catch(err => console.error('❌ Gagal Konek Database:', err));

app.get('/', (req, res) => {
    res.send('MTERP Backend is Running...');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di port ${PORT}`);
});