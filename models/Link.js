const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  short_id : { 
    type:String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true,
  },
  user_id : {
    type: String,
    required: true
  },
  topic : {
    type : String,
    trim: true
  },
  createAt:{
    type: Date,
    Default: Date.now
  }

});

const Link = mongoose.model('link', linkSchema);

module.exports = Link;