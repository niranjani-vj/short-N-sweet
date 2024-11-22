const { Router } = require('express');
const authController = require('../controllers/authController');


const { requireAuth, checkUser } = require('../middleware/authMiddleware.js');
const router = Router();


router
.route('/login')
.get( checkUser,authController.login_get)
.post(authController.login_post);

router.get('/logout',authController.logout_get);

router.post('/auth/google',checkUser,authController.google_login);

module.exports = router;