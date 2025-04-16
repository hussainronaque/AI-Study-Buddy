const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, isOTPVerified } = require('./otp');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Route to request OTP
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const success = await sendOTP(email);
        
        if (success) {
            res.json({ message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error('Error in request-otp:', error);
        res.status(500).json({ error: 'Internal server error' });
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

        // Check if OTP was verified
        if (!isOTPVerified(email)) {
            return res.status(403).json({ error: 'OTP must be verified before resetting password' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Connect to MongoDB
        await client.connect();
        const database = client.db("ai_study_planner_db");
        const usersCollection = database.collection("users");

        // Update user's password
        const result = await usersCollection.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Clear the OTP verification status
        await clearOTPVerification(email);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
});

module.exports = router; 