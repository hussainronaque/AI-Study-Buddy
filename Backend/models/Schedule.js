const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduleNumber: {
        type: Number,
        required: true
    },
    scheduleImage: {
        type: String,
        required: true
    }
}, { collection: 'schedules' }); // Explicitly specify the collection name

module.exports = mongoose.model('Schedule', scheduleSchema); 