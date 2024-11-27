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

  router.route('/api/analytics')
  .get(requireAuth,checkUser,urlController.get_topic_page); 
  router.route('/api/urls')
  .get(requireAuth,checkUser,urlController.get_url_page); 
  
  router.route('/api/topics_list')
  .get(checkUser,urlController.fetch_topics); 

  router.route('/api/urls_list')
  .get(checkUser,urlController.fetch_urls); 
  
  router.route('/api/analytics/topic/:topicName')
  .get(requireAuth,checkUser,urlController.analytics_topic); 
  
  router.route('/api/analytics/overall/:id')
  .get(checkUser,urlController.analytics_overall); 

  router.route('/api/manage_urls')
  .get(requireAuth,checkUser,urlController.manage_url_page); 

  router.route('/api/links')
  .get(checkUser,urlController.fetch_url_details); 

  router.route('/api/link/:short_id')
  .put(checkUser,urlController.update_url_details)
  .delete(checkUser,urlController.delete_url_details); 



module.exports = router;