const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Ensures that the username is unique
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensures that the email is unique
  },
  password: {
    type: String,
    required: true // Password is required
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the model so you can use it in other parts of the application
module.exports = User;
