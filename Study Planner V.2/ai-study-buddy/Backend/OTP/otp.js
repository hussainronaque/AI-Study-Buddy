const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true
});

// Add error handling for email verification
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready');
    }
});

// Generate a random 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Store OTP in database with expiration
async function storeOTP(email, otp) {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db("ai_study_planner_db");
        const collection = database.collection("otps");

        // Delete any existing OTP for this email
        await collection.deleteMany({ email });

        // Store new OTP with 5-minute expiration
        const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await collection.insertOne({
            email,
            otp,
            createdAt: new Date(),
            expiresAt: expirationTime
        });
        console.log('OTP stored successfully for:', email);
    } catch (error) {
        console.error('Error storing OTP:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Verify OTP
async function verifyOTP(email, otp) {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db("ai_study_planner_db");
        const collection = database.collection("otps");

        const storedOTP = await collection.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (storedOTP) {
            // Delete the used OTP
            await collection.deleteOne({ _id: storedOTP._id });
            console.log('OTP verified successfully for:', email);
            return true;
        }
        console.log('Invalid or expired OTP for:', email);
        return false;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Send OTP via email
async function sendOTP(email) {
    const otp = generateOTP();
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #42006C; text-align: center;">Password Reset OTP</h1>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="font-size: 16px; color: #333;">Your OTP for password reset is:</p>
                    <h2 style="color: #42006C; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
                    <p style="color: #666; margin-top: 20px;">This OTP will expire in 5 minutes.</p>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        await storeOTP(email, otp);
        console.log('OTP sent successfully to:', email);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
}

module.exports = {
    sendOTP,
    verifyOTP
}; 