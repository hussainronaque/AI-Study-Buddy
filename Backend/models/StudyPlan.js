const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tasks: [{
        name: {
            type: String,
            required: true
        },
        end_time: {
            type: Date,
            required: true
        }
    }],
    scheduleImage: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'study_plans' });

module.exports = mongoose.model('StudyPlan', studyPlanSchema); 