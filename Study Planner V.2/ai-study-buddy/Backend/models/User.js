const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordOTP: String,
    resetPasswordExpires: Date
}, { collection: 'users' }); // Explicitly specify the collection name

module.exports = mongoose.model('User', userSchema); 