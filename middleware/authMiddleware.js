const redisClient = require('../config/redis');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');  
dotenv.config();

if (!jwt) {
    console.error('JWT is undefined');
}
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.SECRET_CODE, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt || null;
  res.locals.user = false; // Default value for unauthenticated users

  if (token) {
      jwt.verify(token, process.env.SECRET_CODE, async (err, decodedToken) => {
          if (err) {
              console.error('JWT verification failed:', err);
          } else {
              try {
                  const user = await User.findById(decodedToken.id);
                  res.locals.user = user || false;
              } catch (dbError) {
                  console.error('Error fetching user from DB:', dbError);
              }
          }
          next();
      });
  } else {
      console.log('No token found, res.locals.user set to:', res.locals.user);
      next();
  }
};

// Rate limiting middleware
const rateLimiter = async (req, res, next) => {


  const userId = res.locals.user.google_id;
  const redisKey = `rate-limit:${userId}`;

  try {
    const requestCount = await redisClient.incr(redisKey);
    const ttl = await redisClient.ttl(redisKey);
    if (ttl === -1) {
      // Set expiration if not already set
      await redisClient.expire(redisKey, 60);
    }
    
    if (requestCount > 5) {
      const timeLeft = await redisClient.ttl(redisKey);
      return res.status(429).json({
        message: `Rate limit exceeded. Try again in ${timeLeft} seconds.`,
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  module.exports = { requireAuth, checkUser, rateLimiter };