const { Router } = require('express');
const urlController = require('../controllers/urlController');


const { requireAuth, checkUser,rateLimiter } = require('../middleware/authMiddleware.js');
const router = Router();


router.route('/api/shorten/:shortUrl')
  .get(checkUser,urlController.fetch_url); 

router.route('/api/shorten')
  .post(checkUser,rateLimiter, urlController.api_shortener);  

  router.route('/api/analytics/:shortUrl')
  .get(checkUser,urlController.analytics_short_url); 
  
  router.route('/api/analytics/topic/:topicName')
  .get(checkUser,urlController.analytics_topic); 
  
  router.route('/api/analytics/overall/:id')
  .get(checkUser,urlController.analytics_overall); 

module.exports = router;