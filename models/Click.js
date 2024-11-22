const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  short_id : { 
    type:String,
    required: true,
  },
  user_id : {
    type: String,
    required: true
  },
  ip : {
    type: String,
    required: true,
  },
  os_type : {
    type : String,
    trim: true
  },
  device_type:{
    type: String,
    trim:true
  },
  geolocation : [ 
    {
      lat: {
        type: String, 
        default: null,
      }, 
      long: {
        type: String, 
        default: null,
      },
    },
  ],
 
}, { timestamps: true } );

const Click = mongoose.model('click', clickSchema);

module.exports = Click;