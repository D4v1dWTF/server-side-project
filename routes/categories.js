const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Category = require('../models/Category');

// List categories
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const categories = await Category.find({ userId }).sort({ name: 1 });
    res.render('categories/list', { categories });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).send('Error loading categories');
  }
});

// Create category form
router.get('/create', isLoggedIn, (req, res) => {
  res.render('categories/create');
});

// Create category handler
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { name, color } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.redirect('/categories/create?error=Category name is required');
    }
    if (name.trim().length > 50) {
      return res.redirect('/categories/create?error=Category name must be 50 characters or less');
    }

    // Check if category exists
    const existing = await Category.findOne({ userId, name: name.trim() });
    if (existing) {
      return res.redirect('/categories/create?error=Category already exists');
    }

    // Check category count
    const count = await Category.countDocuments({ userId });
    if (count >= 20) {
      return res.redirect('/categories/create?error=Maximum 20 categories allowed');
    }

    await Category.create({
      userId,
      name: name.trim(),
      color: color || '#3498db'
    });

    res.redirect('/categories?success=Category created');
  } catch (error) {
    console.error('Create category error:', error);
    res.redirect('/categories/create?error=Failed to create category');
  }
});

// Update category form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const category = await Category.findOne({ _id: req.params.id, userId });
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('categories/edit', { category });
  } catch (error) {
    console.error('Edit category form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Update category handler
router.post('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const category = await Category.findOne({ _id: req.params.id, userId });
    if (!category) {
      return res.status(404).send('Category not found');
    }

    const { name, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.redirect(`/categories/${req.params.id}/edit?error=Category name is required`);
    }
    if (name.trim().length > 50) {
      return res.redirect(`/categories/${req.params.id}/edit?error=Category name must be 50 characters or less`);
    }

    // Check if name already exists (excluding current)
    const existing = await Category.findOne({ userId, name: name.trim(), _id: { $ne: req.params.id } });
    if (existing) {
      return res.redirect(`/categories/${req.params.id}/edit?error=Category name already exists`);
    }

    category.name = name.trim();
    category.color = color || '#3498db';
    await category.save();

    res.redirect('/categories?success=Category updated');
  } catch (error) {
    console.error('Update category error:', error);
    res.redirect(`/categories/${req.params.id}/edit?error=Failed to update`);
  }
});

// Delete category
router.post('/:id/delete', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const category = await Category.findOne({ _id: req.params.id, userId });
    if (!category) {
      return res.status(404).send('Category not found');
    }

    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories?success=Category deleted');
  } catch (error) {
    console.error('Delete category error:', error);
    res.redirect('/categories?error=Failed to delete category');
  }
});

module.exports = router;

