const { Router } = require('express');
const urlController = require('../controllers/urlController');


const { requireAuth, checkUser } = require('../middleware/authMiddleware.js');
const router = Router();


router.route('/api/shorten/:shortUrl')
  .get(checkUser,urlController.fetch_url); 

router.route('/api/shorten')
  .post(checkUser, urlController.api_shortener);  


module.exports = router;