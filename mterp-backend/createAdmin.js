const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// GANTI INI SESUAI DATABASE KAMU
const MONGO_URI = 'mongodb://localhost:27017/mterp_db'; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Database Konek'))
  .catch(err => console.error('❌ Gagal Konek:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  role: { type: String, default: 'tukang' },
  assignedProject: String 
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    // 1. Cek dulu admin sudah ada belum
    const exist = await User.findOne({ username: 'admin' });
    if (exist) {
      console.log('⚠️ User admin sudah ada!');
      process.exit();
    }

    // 2. Buat password yang sudah di-hash (dienkripsi)
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 3. Simpan ke database
    await User.create({
      username: 'admin',
      password: hashedPassword, // Jangan simpan plain text!
      fullName: 'Administrator Utama',
      role: 'admin'
    });

    console.log('🎉 SUKSES! User admin berhasil dibuat.');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Gagal:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();