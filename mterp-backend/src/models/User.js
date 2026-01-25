const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    fullName: String,
    role: {
        type: String,
        enum: ['owner', 'director', 'asset_admin', 'supervisor', 'worker'],
        default: 'worker'
    },
    assignedProject: String,
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date
});
module.exports = mongoose.model('User', userSchema);
