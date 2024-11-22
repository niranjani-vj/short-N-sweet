const Link = require('../models/Link');
const shortid = require('shortid');


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
        res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports.fetch_url = async (req, res) => {

    // Check if user is authenticated
    if (res.locals.user) {
        console.log('User not authenticated, redirecting to login');
        var userId = res.locals.user.google_id||null;
        
    }

    // If authenticated, proceed with shortening logic
    try {
        // var userId = res.locals.user.google_id;

        console.log('req.params::', req.params);
        const shortUrl  = req.params.shortUrl;
        try {
            var dataLink = await Link.findOne({ short_id: shortUrl });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        //TODO:: ------------------Upsert Query from clicks------------------
        
        res.redirect(dataLink.link)
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
