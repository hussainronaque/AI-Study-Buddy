const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('./otp');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Add connection error handling
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Requesting OTP for:', email); // Add logging
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const success = await sendOTP(email);
        console.log('OTP send result:', success); // Add logging
        
        if (success) {
            res.json({ message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error('Detailed error in request-otp:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const isValid = await verifyOTP(email, otp);
        
        if (isValid) {
            res.json({ message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Connect to MongoDB
        await client.connect();
        const database = client.db("ai_study_planner_db");
        const usersCollection = database.collection("users");

        // Update user's password
        // Note: In a real application, you would hash the password before storing it
        const result = await usersCollection.updateOne(
            { email },
            { $set: { password } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
});

module.exports = router; 