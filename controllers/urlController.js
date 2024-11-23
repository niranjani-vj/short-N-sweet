const Link = require('../models/Link');
const Click = require('../models/Click');
const shortid = require('shortid');
const axios = require('axios');


module.exports.api_shortener = async (req, res) => {

    // Check if user is authenticated
    if (!res.locals.user) {
        console.log('User not authenticated, redirecting to login');
        
        // If it's an API request, return 401 instead of redirecting
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    // If authenticated, proceed with shortening logic
    try {
        var userId = res.locals.user.google_id;

        const { longUrl, customAlias, topic } = req.body;
        console.log('req.body::', req.body);
        var customName = null;
        var shortLink;
        if(customAlias){
            console.log('customAlias',customAlias);
            customName = await Link.findOne({ short_id:customAlias });
            console.log('customName:',customName);
            if(customName==null){
                shortLink = customAlias;
            }else{
                shortLink = shortid.generate();
            }
        } else {
            shortLink = shortid.generate();
        }

        let newLink = await Link.create({
            short_id: shortLink,
            link: longUrl,
            user_id:userId,
            topic: topic,
            createAt:new Date()
        });
        res.status(201).json({ shortUrl: newLink.short_id,createdAt:newLink.createAt });
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ status:'failed', message: error.message });
    }
};
module.exports.fetch_url = async (req, res) => {

    // Check if user is authenticated
    if (res.locals.user) {
        console.log('User not authenticated, redirecting to login');
        var userId = res.locals.user.google_id||null; 
    }
    try {
        // var userId = res.locals.user.google_id;
        const shortUrl  = req.params.shortUrl;
        try {
            var dataLink = await Link.findOne({ short_id: shortUrl });
            // Ip, GeoLoacation & useragent
            // const userIp = req.ip; // Get user's IP
            const userIp = '49.37.241.206'; // Get user's IP
            try {
                const response = await axios.get(`http://ip-api.com/json/${userIp}`);
                const geoData  = response.data;

                if (geoData.status === 'fail') {
                    console.log(`Could not determine geolocation for IP: ${userIp}`);
                } else {
                    var country   = geoData.country;
                    var state     = geoData.regionName;
                    var city      = geoData.city;
                    var latitude  = geoData.lat;
                    var longitude = geoData.lon;
                }
            } catch (error) {
                console.log('Error fetching geolocation data.');
            }
            const userAgentInfo = req.useragent;
            var os              = userAgentInfo.os;               
            var platform        = userAgentInfo.platform;   

            if(dataLink){
                let clickCount = await Click.create({
                    short_id: shortUrl,
                    user_id:userId,
                    ip: userIp,
                    os_type: os,
                    device_type:platform,
                    geolocation:{
                        country:country, 
                        state:state, 
                        city:city, 
                        latitude:latitude,
                        longitude:longitude
                    }
                 });
                 console.log('clickCounts::',clickCount);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        
        res.redirect(dataLink.link)
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.analytics_short_url = async (req,res) => {
    // total clicks & Unique users

    //clickByDate

    //OsType

    //DeviceType

    //response together 
};
