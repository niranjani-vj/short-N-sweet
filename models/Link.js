const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    short_id: { 
      type: String,
      required: true,
      unique: true,
      index: true, 
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v); // Basic URL validation
        },
        message: props => `${props.value} is not a valid URL!`
      },
    },
    user_id: {
      type: String,
      required: true,
      index: true,  
    },
    topic: {
      type: String,
      trim: true,
      default: null, 
    },
  }
);

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;