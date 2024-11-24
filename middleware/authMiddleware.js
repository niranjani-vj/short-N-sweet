const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');  // Load environment variables
dotenv.config();

if (!jwt) {
    console.error('JWT is undefined');
}
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log('user-req::', token);

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.SECRET_CODE, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
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


  module.exports = { requireAuth, checkUser };