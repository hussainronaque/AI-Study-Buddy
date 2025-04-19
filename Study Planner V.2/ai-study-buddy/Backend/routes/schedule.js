const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const path = require('path');
const fs = require('fs');

router.post('/upload', auth, async (req, res) => {
    try {
        if (!req.files || !req.files.schedule) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const scheduleFile = req.files.schedule;
        const fileName = `schedule-${Date.now()}${path.extname(scheduleFile.name)}`;
        const uploadPath = path.join(__dirname, '../uploads', fileName);

        // Create directory if it doesn't exist
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Move the uploaded file
        await scheduleFile.mv(uploadPath);

        // Create URL for the uploaded file
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

        // Save to MongoDB
        const schedule = new Schedule({
            user: req.user.id,
            imageUrl: imageUrl,
            filename: fileName
        });
        await schedule.save();

        res.json({
            success: true,
            imageUrl: imageUrl,
            schedule: schedule
        });

    } catch (error) {
        console.error('Schedule upload error:', error);
        res.status(500).json({ 
            message: 'Error uploading schedule',
            error: error.message 
        });
    }
});

// Get user's schedules
router.get('/', auth, async (req, res) => {
    try {
        const schedules = await Schedule.find({ user: req.user.id })
            .sort({ uploadedAt: -1 });
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Error fetching schedules' });
    }
});

module.exports = router;  // Make sure this line is present