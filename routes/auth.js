const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Category = require('../models/Category');
const { isLoggedIn } = require('../middleware/auth');

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { error: null });
});

// Register handler
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || username.trim().length < 3 || username.trim().length > 30) {
      return res.render('auth/register', { error: 'Username must be 3-30 characters' });
    }
    if (!email || !email.includes('@')) {
      return res.render('auth/register', { error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.render('auth/register', { error: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.render('auth/register', { error: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.render('auth/register', { error: 'Username or email already exists' });
    }

    // Create user (balances default to 0)
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      currentBalance: 0,
      savingsBalance: 0
    });
    await user.save();

    // Create default categories
    const defaultCategories = [
      { name: 'Food', color: '#e74c3c' },
      { name: 'Transport', color: '#3498db' },
      { name: 'Entertainment', color: '#9b59b6' },
      { name: 'Bills', color: '#f39c12' },
      { name: 'Shopping', color: '#1abc9c' },
      { name: 'Uncategorized', color: '#95a5a6' }
    ];
    for (const cat of defaultCategories) {
      await Category.create({ userId: user._id, name: cat.name, color: cat.color });
    }

    req.session.user = { id: user._id, username: user.username };
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', { error: 'Registration failed. Please try again.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.render('auth/login', { error: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.user = { id: user._id, username: user.username };
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.get('/logout', isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;

