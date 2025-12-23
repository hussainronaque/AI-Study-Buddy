const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');
const auth = require('../middleware/auth');
const { spawn } = require('child_process');
const path = require('path');

// Helper function to run study plan script and return a promise
const runStudyPlanScript = (userId) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'Input Schedule', 'study_plan.py');
    
    console.log(`Running Python script at: ${scriptPath}`);
    
    const pythonProcess = spawn('python3', [
      scriptPath,
      '--user',
      userId
    ]);
    
    let scriptOutput = '';
    let scriptError = '';
    
    // Set a timeout of 30 seconds
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      console.error('Python script timed out after 30 seconds');
      resolve(null); // Resolve with null to not block the API
    }, 30000);
    
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      console.log(`Python script output: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error(`Python script error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve(scriptOutput);
      } else {
        console.error(`Python script exited with code ${code}`);
        console.error(`Script error: ${scriptError}`);
        resolve(null); // Resolve with null to not block the API
      }
    });
    
    pythonProcess.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Failed to start Python script:', err);
      resolve(null); // Resolve with null to not block the API
    });
  });
};

// Create a new study plan
router.post('/', auth, async (req, res) => {
    try {
        const { tasks, scheduleImage } = req.body;

        // Validate required fields
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ message: 'Tasks are required and must be an array' });
        }

        if (!scheduleImage) {
            return res.status(400).json({ message: 'Schedule image is required' });
        }

        // Create new study plan
        const studyPlan = new StudyPlan({
            userId: req.user.id,
            tasks: tasks.map(task => ({
                name: task.name,
                end_time: new Date(task.end_time)
            })),
            scheduleImage: scheduleImage
        });

        await studyPlan.save();
        
        // Run Python script after creating the study plan and wait for it to complete
        await runStudyPlanScript(req.user.id);
        
        // Fetch the updated study plan after the script has run
        const updatedStudyPlan = await StudyPlan.findById(studyPlan._id);
        
        res.status(201).json(updatedStudyPlan);
    } catch (err) {
        console.error('Error creating study plan:', err);
        res.status(500).json({ message: 'Error creating study plan', error: err.message });
    }
});

// Get all study plans for a user
router.get('/', auth, async (req, res) => {
    try {
        const studyPlans = await StudyPlan.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(studyPlans);
    } catch (err) {
        console.error('Error fetching study plans:', err);
        res.status(500).json({ message: 'Error fetching study plans', error: err.message });
    }
});

// Update a study plan
router.put('/:id', auth, async (req, res) => {
    try {
        const { tasks } = req.body;

        // Validate tasks
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ message: 'Tasks are required and must be an array' });
        }

        // Find the study plan and verify ownership
        const studyPlan = await StudyPlan.findById(req.params.id);
        if (!studyPlan) {
            return res.status(404).json({ message: 'Study plan not found' });
        }

        if (studyPlan.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this study plan' });
        }

        // Update tasks
        studyPlan.tasks = tasks.map(task => ({
            name: task.name,
            end_time: new Date(task.end_time)
        }));

        await studyPlan.save();
        
        // Run Python script after updating the study plan and wait for it to complete
        await runStudyPlanScript(req.user.id);
        
        // Fetch the updated study plan after the script has run
        const updatedStudyPlan = await StudyPlan.findById(req.params.id);
        
        res.json(updatedStudyPlan);
    } catch (err) {
        console.error('Error updating study plan:', err);
        res.status(500).json({ message: 'Error updating study plan', error: err.message });
    }
});

// Delete a study plan
router.delete('/:id', auth, async (req, res) => {
    try {
        // Find the study plan and verify ownership
        const studyPlan = await StudyPlan.findById(req.params.id);
        if (!studyPlan) {
            return res.status(404).json({ message: 'Study plan not found' });
        }

        if (studyPlan.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this study plan' });
        }

        await StudyPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Study plan deleted successfully' });
    } catch (err) {
        console.error('Error deleting study plan:', err);
        res.status(500).json({ message: 'Error deleting study plan', error: err.message });
    }
});

module.exports = router;