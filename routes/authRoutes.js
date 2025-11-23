// Authentication Routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Register POST
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validation
    if (!username || !password || !email) {
      return res.render('register', { error: 'All fields are required' });
    }
    
    if (username.length < 3) {
      return res.render('register', { error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
      return res.render('register', { error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.render('register', { error: 'Username or email already exists' });
    }
    
    // Create new user
    const newUser = new User({ username, password, email });
    await newUser.save();
    
    res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.render('login', { error: 'All fields are required' });
    }
    
    // Find user
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    res.redirect('/songs');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;

