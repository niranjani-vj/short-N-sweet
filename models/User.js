const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  google_id : { 
    type:String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  given_name : {
    type: String,
    trim:true,
    required: true
  },
  family_name : {
    type : String,
    trim: true,
    required: true
  },
  picture:{
    type: String,
    default : 'user.png'
  },
  createAt:{
    type: Date,
    Default: Date.now
  }

});



const User = mongoose.model('user', userSchema);

module.exports = User;