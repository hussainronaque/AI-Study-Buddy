const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const mongoose = require('mongoose');

// Get user settings
router.get('/:userId', async (req, res) => {
    try {
        console.log('Fetching settings for userId:', req.params.userId);
        const settings = await Settings.findOne({ userId: req.params.userId });
        if (!settings) {
            console.log('No settings found for userId:', req.params.userId);
            return res.status(404).json({ message: 'Settings not found' });
        }
        console.log('Found settings:', settings);
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ 
            message: 'Error fetching settings',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update user settings
router.put('/:userId', async (req, res) => {
    try {
        console.log('Updating settings for userId:', req.params.userId);
        console.log('Request body:', req.body);

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const { backgroundColor, sidebarColor } = req.body;

        // Validate required fields
        if (!backgroundColor || !sidebarColor) {
            return res.status(400).json({ message: 'backgroundColor and sidebarColor are required' });
        }

        // Validate color formats
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/;
        if (!colorRegex.test(backgroundColor) || !colorRegex.test(sidebarColor)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        const settings = await Settings.findOneAndUpdate(
            { userId: req.params.userId },
            { 
                userId: req.params.userId,
                backgroundColor, 
                sidebarColor 
            },
            { 
                new: true, 
                upsert: true,
                runValidators: true 
            }
        );

        console.log('Updated settings:', settings);
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ 
            message: 'Error updating settings',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router; 