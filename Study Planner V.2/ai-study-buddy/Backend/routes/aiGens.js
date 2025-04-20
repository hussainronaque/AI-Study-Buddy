const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const AiGen    = require('../models/AiGen');

// GET study plan for a specific user
router.get('/study_plan/:userId', async (req, res) => {
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

module.exports = router;
