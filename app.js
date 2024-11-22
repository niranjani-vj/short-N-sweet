const express = require('express');
const mongoose = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
require('dotenv').config();
const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authRoutes);
app.use(urlRoutes);

// view engine
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.locals.user = false; // Default value
  res.removeHeader("Cross-Origin-Opener-Policy");
  next();
});
app.use(checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/profile', requireAuth, (req, res) => res.render('profile'));

app.listen({ port:  process.env.PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
});