const mongoose = require('mongoose');

const aiGenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // ← use ObjectId if that’s what’s in the DB
    ref: 'User',
    required: true
  },
  plan: [
    {
      day:     String,
      subject: String,
      duration:String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// Force use of the `ai_gens` collection
module.exports = mongoose.model(
  'AiGen',
  aiGenSchema,
  'ai_gens'
);
