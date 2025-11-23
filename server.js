// Jolly Beats Server
// COMP3810SEF Project - Music sharing platform

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musicspot';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'musicspot-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: mongoURI,
    touchAfter: 24 * 3600
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const forumRoutes = require('./routes/forumRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Use routes
app.use('/', authRoutes);
app.use('/songs', songRoutes);
app.use('/playlists', playlistRoutes);
app.use('/forum', forumRoutes);
app.use('/api', apiRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
app.listen(PORT, () => {
  console.log(`Jolly Beats server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

