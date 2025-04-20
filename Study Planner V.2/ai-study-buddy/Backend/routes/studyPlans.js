const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');
const auth = require('../middleware/auth');

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
        res.status(201).json(studyPlan);
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
        res.json(studyPlan);
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