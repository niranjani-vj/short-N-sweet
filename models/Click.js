const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
  {
    short_id: { 
      type: String, 
      required: true, 
    },
    user_id: {
      type: String,
      default: null,
    },
    ip: { 
      type: String, 
      default: null,
    },
    os_type: {
      type: String,
      trim: true,
      default: null,
    },
    device_type: {
      type: String,
      trim: true,
      default: null,
    },
    geolocation: { 
      country: { type: String, default: null },
      state: { type: String, default: null },
      city: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
  },
  { timestamps: true }
);


  //TODO:Functions (Statics)

   // total clicks & Unique users
   clickSchema.statics.getClickCounts = async function (conditionColumn,conditionValue) {
    const matchConditon = {};
    matchConditon[conditionColumn] = conditionValue;
    return this.aggregate([
      {
        $match: matchConditon, 
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalClicks: { $sum: 1 }, // Count total documents
          uniqueUsers: { $addToSet: "$user_id" } // Collect unique user IDs into a set
        }
      },
      {
        $project: {
          totalClicks: 1, // Include totalClicks in the output
          uniqueUsers: { $size: "$uniqueUsers" } // Calculate the size of the unique user set
        }
      }
    ])
  };  

  //clickByDate
  clickSchema.statics.getClicksByDateDetails = async function (conditionColumn,conditionValue,maxLimit) {
    const matchConditon = {};
    matchConditon[conditionColumn] = conditionValue;
    return this.aggregate([
      {
        $match: matchConditon, 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          totalClickCount: { $sum: 1 }, // Count total documents
        },
      },
      {
        $sort: { _id: -1 }, // Sort by date in descending order
      },
      {
        $limit: maxLimit, // Limit to the top 7 results
      },
      {
        $project: {
          clickByDate: "$_id", // Rename _id to clickByDate
          totalClickCount: 1,  // Keep totalClickCount
          _id: 0,              // Exclude the default _id field
        },
      },
    ]);
  };    

  //OsType
  clickSchema.statics.getOsClickDetails = async function (conditionColumn,conditionValue) {
    const matchConditon = {};
    matchConditon[conditionColumn] = conditionValue;
    return this.aggregate([
      {
        $match: matchConditon, 
      },
      {
        $group: {
          _id: "$os_type", // Group all matching documents together
          uniqueClicks: { $sum: 1 }, // Count total documents
          uniqueUsers: { $addToSet: "$user_id" } // Collect unique user IDs into a set
        }
      },
      {
        $project: {
          osName:"$_id",
          totalClicks: "$uniqueClicks", // Include totalClicks in the output
          uniqueUsers: { $size: "$uniqueUsers" },
          _id:0
        }
      }
    ]);
  };  


  //DeviceType

  //response together 


const Click = mongoose.model('Click', clickSchema);

module.exports = Click;