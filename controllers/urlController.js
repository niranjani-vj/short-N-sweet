const redisClient = require('../config/redis');
const Link = require('../models/Link');
const Click = require('../models/Click');

const shortid = require('shortid');
const axios = require('axios');


module.exports.api_shortener = async (req, res) => {

    // Check if user is authenticated
    if (!res.locals.user) {
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
            short_id: shortLink.toLowerCase(),
            link: longUrl,
            user_id:userId,
            topic: topic,
            createAt:new Date()
        });
        const keys = await redisClient.keys('analytics:*');
        await Promise.all(keys.map((key) => redisClient.del(key)));
        res.status(201).json({ shortUrl: newLink.short_id,createdAt:newLink.createAt });
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ status:'failed', message: error.message });
    }
};
module.exports.fetch_url = async (req, res) => {

    // Check if user is authenticated
    if (res.locals.user) {
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
                const keys = await redisClient.keys('analytics:*');
                await Promise.all(keys.map((key) => redisClient.del(key)));

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
        const cacheKey = `analytics:shortUrl:${shortUrl}`;
        // Check the cache first
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData)); // Return cached data
        }
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

        let responseData = {
            totalClicks,
            uniqueUsers,
            clickByDate: clickByDate || [],
            clickOsTypeCount: clickOsTypeCount || [],
            clickDeviceTypeCount: clickDeviceTypeCount || [],
        };
         // Cache the result with a timeout of 1 hour
         await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

        // Respond with all results
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error in analytics_short_url:', error);

        // Respond with error details
        res.status(500).json({ error: "An error occurred while processing the analytics data." });
    }
};

module.exports.get_topic_page = (req, res) => {
    res.render('analytics_topic');
}
module.exports.get_url_page = (req, res) => {
    res.render('analytics_url');
}
module.exports.manage_url_page = (req, res) => {
    res.render('short_urls');
}



  module.exports.fetch_topics =  async (req, res) => {
    try {
      const userId = res.locals.user.google_id || null;
      // Fetch unique topics for the given userId
      const topics = await Link.distinct('topic', { user_id: userId });
        
      res.status(200).json({ topics });
    } catch (err) {
      console.error('Error fetching topics:', err);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  }
  module.exports.fetch_urls=  async (req, res) => {
    try {
      const userId = res.locals.user.google_id || null;
      // Fetch unique topics for the given userId
      const urls = await Link.distinct('short_id', { user_id: userId });
        
      res.status(200).json({ urls });
    } catch (err) {
      console.error('Error fetching urls:', err);
      res.status(500).json({ error: 'Failed to fetch urls' });
    }
  }

module.exports.analytics_topic = async (req, res) => {
    const searchBy = 'topic';
    const topicName = req.params.topicName;

    // Validate the input
    if (!topicName) {
        return res.status(400).json({ error: "Invalid or missing topicName parameter." });
    }

    try {
        var userId = res.locals.user.google_id || null;
        const cacheKey = `analytics:topic:${topicName}`;
        // Check the cache first
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData)); // Return cached data
        }
        // Run all async operations concurrently
        const [clickCounts, clickByDate, clickShortUrlCount] = await Promise.all([
            //totalClicks & uniqueUsers
            Click.getClickCounts(searchBy, topicName), 
            //clickByDate
            Click.getClicksByDateDetails(searchBy, topicName, 7),
            //osType
            Click.getTopicUrlDetails(searchBy, topicName, '$short_id',userId),
        ]);

        // Handle potential empty results gracefully
        const totalClicks = clickCounts?.[0]?.totalClicks || 0;
        const uniqueUsers = clickCounts?.[0]?.uniqueUsers || 0;

        let responseData = {
            totalClicks,
            uniqueUsers,
            clickByDate: clickByDate || [],
            urls: clickShortUrlCount || [],
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
        // Respond with all results
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error in analytics_short_url:', error);

        // Respond with error details
        res.status(500).json({ error: "An error occurred while processing the analytics data." });
    }
};

module.exports.analytics_overall = async (req, res) => {
    if (res.locals.user) {
        var userId = res.locals.user.google_id || false; 
    }
    const searchBy = 'user_id';

    // Validate the input
    if (!userId) {
        return  res.redirect('/login');
    }

    try {
        const cacheKey = `analytics:user:${userId}`;
        // Check the cache first
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            const responseData = JSON.parse(cachedData);
            return res.render('analytics_overall', { data: responseData, userid: userId });
        }
        // Run all async operations concurrently
        const [totalUrlsResult,clickCounts, clickByDate, clickOsTypeCount, clickDeviceTypeCount] = await Promise.all([
             Link.aggregate([
                { $match: { user_id: userId } },
                { $count: "totalUrls" }
              ]),
            //totalClicks & uniqueUsers
            Click.getClickCounts(searchBy, userId), 
            //clickByDate
            Click.getClicksByDateDetails(searchBy, userId, 7),
            //osType
            Click.getTypeClickDetails(searchBy, userId, '$os_type'),
            //deviceType
            Click.getTypeClickDetails(searchBy, userId, '$device_type')

        ]);

        // Handle potential empty results gracefully
        const totalUrls = totalUrlsResult.length > 0 ? totalUrlsResult[0].totalUrls : 0;
        const totalClicks = clickCounts?.[0]?.totalClicks || 0;
        const uniqueUsers = clickCounts?.[0]?.uniqueUsers || 0;

        let responseData = {
            totalUrls,
            totalClicks,
            uniqueUsers,
            clickByDate: clickByDate || [],
            clickOsTypeCount: clickOsTypeCount || [],
            clickDeviceTypeCount: clickDeviceTypeCount || []
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

        // Respond with all results
        res.render('analytics_overall', { data:responseData, userid:userId });
    } catch (error) {
        console.error('Error in analytics_short_url:', error);

        // Respond with error details
        res.status(500).json({ error: "An error occurred while processing the analytics data." });
    }
};

//get
module.exports.fetch_url_details = async (req, res) => {
    const user_id =  res.locals.user.google_id || false; 
    try {
      const links = await Link.find({ user_id: user_id });
      res.status(200).json(links);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

//update
module.exports.update_url_details =
async (req, res) => {
    try {
      const { link, topic } = req.body;
      const updatedLink = await Link.findOneAndUpdate(
        { short_id: req.params.short_id },
        { link, topic },
        { new: true }
      );
      if (!updatedLink) return res.status(404).json({ error: 'Link not found' });
      res.status(200).json({ message: 'Link updated successfully', link: updatedLink });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

//delete
module.exports.delete_url_details =
async (req, res) => {
    try {
      const deletedLink = await Link.findOneAndDelete({ short_id: req.params.short_id });
      if (!deletedLink) return res.status(404).json({ error: 'Link not found' });
      res.status(200).json({ message: 'Link deleted successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };