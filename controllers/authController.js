
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const dotenv = require('dotenv');  // Load environment variables
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// handle errors
const handleErrors = (err) => {
  let errors = { email: '', password: '' };

    // incorrect email
    if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered';
    }
  
    // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect';
    }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'This email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}


module.exports.login_get = (req, res) => {
  res.render('login',{ googleClientId: process.env.GOOGLE_CLIENT_ID });
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_CODE, {
    expiresIn: maxAge
  });
};


module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.logout_get = (req, res) => {
  // res.cookie('jwt', '', { maxAge: 1 });
  res.clearCookie('jwt');
  res.locals.user = false;
  res.redirect('/');
}

module.exports.google_login = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // Extract user information
    const { sub, email, given_name,family_name, picture } = payload;
    const password = 'password123'
    // Check if user exists in the database
    let user = await User.findOne({ google_id: sub });
    if (!user) {
      const user = await User.create({google_id:sub, email, given_name,family_name,picture });

      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: user._id });
    } else{
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    }

    // res.status(200).json({ message: "User authenticated", user });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(400).json({ error: "Invalid token" });
  }
}

