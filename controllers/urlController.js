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
        var customName = null;
        var shortLink;
        if(customAlias){
            customName = await Link.findOne({ short_id:customAlias });
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
            if (userAgentInfo.isMobile) {
                deviceType = 'Mobile';
            } else if (userAgentInfo.isTablet) {
                deviceType = 'Tablet';
            } else if (userAgentInfo.isDesktop) {
                deviceType = 'Desktop';
            }

            if(dataLink){
                let clickCount = await Click.create({
                    short_id: shortUrl,
                    topic:dataLink.topic,
                    user_id:userId,
                    ip: userIp,
                    os_type: os,
                    device_type:deviceType,
                    geolocation:{
                        country:country, 
                        state:state, 
                        city:city, 
                        latitude:latitude,
                        longitude:longitude
                    }
                 });
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

module.exports.analytics_short_url = async (req, res) => {
    const searchBy = 'short_id';
    const shortUrl = req.params.shortUrl;

    // Validate the input
    if (!shortUrl) {
        return res.status(400).json({ error: "Invalid or missing shortUrl parameter." });
    }

    try {
        // Run all async operations concurrently
        const [clickCounts, clickByDate, clickOsTypeCount, clickDeviceTypeCount] = await Promise.all([
            //totalClicks & uniqueUsers
            Click.getClickCounts(searchBy, shortUrl), 
            //clickByDate
            Click.getClicksByDateDetails(searchBy, shortUrl, 7),
            //osType
            Click.getTypeClickDetails(searchBy, shortUrl, '$os_type'),
            //deviceType
            Click.getTypeClickDetails(searchBy, shortUrl, '$device_type'),
        ]);

        // Handle potential empty results gracefully
        const totalClicks = clickCounts?.[0]?.totalClicks || 0;
        const uniqueUsers = clickCounts?.[0]?.uniqueUsers || 0;

        // Respond with all results
        res.status(200).json({
            totalClicks,
            uniqueUsers,
            clickByDate: clickByDate || [],
            clickOsTypeCount: clickOsTypeCount || [],
            clickDeviceTypeCount: clickDeviceTypeCount || [],
        });
    } catch (error) {
        console.error('Error in analytics_short_url:', error);

        // Respond with error details
        res.status(500).json({ error: "An error occurred while processing the analytics data." });
    }
};

module.exports.analytics_topic = async (req, res) => {
    const searchBy = 'topic';
    const topicName = req.params.topicName;

    // Validate the input
    if (!topicName) {
        return res.status(400).json({ error: "Invalid or missing topicName parameter." });
    }

    try {
        // Run all async operations concurrently
        const [clickCounts, clickByDate, clickShortUrlCount] = await Promise.all([
            //totalClicks & uniqueUsers
            Click.getClickCounts(searchBy, topicName), 
            //clickByDate
            Click.getClicksByDateDetails(searchBy, topicName, 7),
            //osType
            Click.getTypeClickDetails(searchBy, topicName, '$short_id'),
        ]);

        // Handle potential empty results gracefully
        const totalClicks = clickCounts?.[0]?.totalClicks || 0;
        const uniqueUsers = clickCounts?.[0]?.uniqueUsers || 0;

        // Respond with all results
        res.status(200).json({
            totalClicks,
            uniqueUsers,
            clickByDate: clickByDate || [],
            urls: clickShortUrlCount || [],
        });
    } catch (error) {
        console.error('Error in analytics_short_url:', error);

        // Respond with error details
        res.status(500).json({ error: "An error occurred while processing the analytics data." });
    }
};

module.exports.analytics_overall = async (req, res) => {
    if (res.locals.user) {
        var userId = res.locals.user.google_id || req.params.id || false; 
    }
    const searchBy = 'user_id';

    // Validate the input
    if (!userId) {
        return res.status(400).json({ error: "Please login with Google" });
    }

    try {
        // Run all async operations concurrently
        const [clickCounts, clickByDate, clickOsTypeCount, clickDeviceTypeCount] = await Promise.all([
            //totalClicks & uniqueUsers
            Click.getClickCounts(searchBy, userId), 
            //clickByDate
            Click.getClicksByDateDetails(searchBy, userId, 7),
            //osType
            Click.getTypeClickDetails(searchBy, userId, '$os_type'),
            //deviceType
            Click.getTypeClickDetails(searchBy, userId, '$device_type'),
        ]);

        // Handle potential empty results gracefully
        const totalUrls = clickCounts?.[0]?.totalUrls || 0;
        const totalClicks = clickCounts?.[0]?.totalClicks || 0;
        const uniqueUsers = clickCounts?.[0]?.uniqueUsers || 0;

        // Respond with all results
        res.status(200).json({
            totalUrls,
            totalClicks,
            uniqueUsers,
            clickByDate: clickByDate || [],
            clickOsTypeCount: clickOsTypeCount || [],
            clickDeviceTypeCount: clickDeviceTypeCount || [],
        });
    } catch (error) {
        console.error('Error in analytics_short_url:', error);

        // Respond with error details
        res.status(500).json({ error: "An error occurred while processing the analytics data." });
    }
};