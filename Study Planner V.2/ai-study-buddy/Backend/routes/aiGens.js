const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const AiGen    = require('../models/AiGen');
const { spawn } = require('child_process');
const path = require('path');
const auth = require('../middleware/auth');

// Helper function to run study plan script and return a promise
const runStudyPlanScript = (userId) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'Input Schedule', 'study_plan.py');
    
    console.log(`Running Python script at: ${scriptPath}`);
    
    const pythonProcess = spawn('python', [
      scriptPath,
      '--user',
      userId
    ]);
    
    let scriptOutput = '';
    let scriptError = '';
    
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      console.log(`Python script output: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error(`Python script error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(scriptOutput);
      } else {
        console.error(`Python script exited with code ${code}`);
        // Still resolve to not block the API response
        resolve(scriptOutput);
      }
    });
    
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python script:', err);
      // Still resolve to not block the API response
      resolve(null);
    });
  });
};

// GET study plan for a specific user
router.get('/study_plan/:userId', auth, async (req, res) => {
  try {
    const rawId = req.params.userId;
    let query;

    if (mongoose.isValidObjectId(rawId)) {
      // must use `new` with the ObjectId constructor
      query = { userId: new mongoose.Types.ObjectId(rawId) };
    } else {
      query = { userId: rawId };
    }

    const plan = await AiGen.findOne(query);
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    res.json(plan);
  } catch (err) {
    console.error('❌ Error fetching study plan:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST route to generate a new study plan
router.post('/generate_study_plan', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Verify that the user is authorized to generate a plan for this userId
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to generate study plan for this user' });
    }

    // Run the Python script to generate a new study plan
    await runStudyPlanScript(userId);

    res.json({ success: true, message: 'Study plan generation started' });
  } catch (err) {
    console.error('❌ Error generating study plan:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
