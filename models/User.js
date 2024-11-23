const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    google_id: { 
      type: String,
      required: true,
      unique: true,  // Ensuring google_id is unique
    },
    email: {
      type: String,
      required: true,
      unique: true,  // Ensuring email is unique
      trim: true,    // Trimming extra spaces
      lowercase: true,  // Making sure email is stored in lowercase
    },
    given_name: {
      type: String,
      trim: true,
      required: true,
    },
    family_name: {
      type: String,
      trim: true,
      required: true,
    },
    picture: {
      type: String,
      default: 'user.png',  // Default profile picture
    },
  },
  { timestamps: true }  // Removed createdAt and updatedAt, not needed
);

const User = mongoose.model('User', userSchema);

module.exports = User;