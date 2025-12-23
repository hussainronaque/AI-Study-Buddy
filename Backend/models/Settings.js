const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    backgroundColor: {
        type: String,
        required: true,
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/
    },
    sidebarColor: {
        type: String,
        required: true,
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/
    }
}, { collection: 'settings' }); // Explicitly specify the collection name

module.exports = mongoose.model('Settings', settingsSchema); 