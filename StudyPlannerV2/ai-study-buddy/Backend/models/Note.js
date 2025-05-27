const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true,
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/
    },
    isPinned: {
        type: Boolean,
        required: true,
        default: false
    },
    isArchived: {
        type: Boolean,
        required: true,
        default: false
    },
    tags: [{
        type: String
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    collection: 'notes',
    timestamps: true // This will automatically manage createdAt and updatedAt
}); 

module.exports = mongoose.model('Note', noteSchema); 