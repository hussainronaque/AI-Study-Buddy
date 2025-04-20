const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/schedules/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all schedules for a user
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id });
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ message: 'Error fetching schedules', error: err.message });
  }
});

// Upload a new schedule
router.post('/upload', auth, upload.single('schedule'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newSchedule = new Schedule({
      userId: req.user.id,
      scheduleNumber: req.body.scheduleNumber || 1,
      scheduleImage: req.file.path
    });

    await newSchedule.save();
    res.status(201).json({ message: 'Schedule uploaded successfully', schedule: newSchedule });
  } catch (err) {
    console.error('Error uploading schedule:', err);
    res.status(500).json({ message: 'Error uploading schedule', error: err.message });
  }
});

module.exports = router; 