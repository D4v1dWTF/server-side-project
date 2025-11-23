const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Budget = require('../models/Budget');

// List budgets
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const budgets = await Budget.find({ userId }).sort({ monthYear: -1 });
    res.render('budgets/list', { budgets });
  } catch (error) {
    console.error('List budgets error:', error);
    res.status(500).send('Error loading budgets');
  }
});

// Create budget form
router.get('/create', isLoggedIn, (req, res) => {
  res.render('budgets/create');
});

// Create budget handler
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { monthYear, budgetAmount } = req.body;

    // Validation
    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
      return res.redirect('/budgets/create?error=Invalid month format (YYYY-MM)');
    }
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.redirect('/budgets/create?error=Budget amount must be a positive number');
    }

    // Check if budget exists
    const existing = await Budget.findOne({ userId, monthYear });
    if (existing) {
      return res.redirect('/budgets/create?error=Budget for this month already exists');
    }

    await Budget.create({ userId, monthYear, budgetAmount: amount, currentSpent: 0 });
    res.redirect('/budgets?success=Budget created');
  } catch (error) {
    console.error('Create budget error:', error);
    res.redirect('/budgets/create?error=Failed to create budget');
  }
});

// Update budget form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const budget = await Budget.findOne({ _id: req.params.id, userId });
    if (!budget) {
      return res.status(404).send('Budget not found');
    }
    res.render('budgets/edit', { budget });
  } catch (error) {
    console.error('Edit budget form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Update budget handler
router.post('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const budget = await Budget.findOne({ _id: req.params.id, userId });
    if (!budget) {
      return res.status(404).send('Budget not found');
    }

    const { budgetAmount } = req.body;
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.redirect(`/budgets/${req.params.id}/edit?error=Budget amount must be a positive number`);
    }

    budget.budgetAmount = amount;
    await budget.save();

    res.redirect('/budgets?success=Budget updated');
  } catch (error) {
    console.error('Update budget error:', error);
    res.redirect(`/budgets/${req.params.id}/edit?error=Failed to update`);
  }
});

// Delete budget
router.post('/:id/delete', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const budget = await Budget.findOne({ _id: req.params.id, userId });
    if (!budget) {
      return res.status(404).send('Budget not found');
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.redirect('/budgets?success=Budget deleted');
  } catch (error) {
    console.error('Delete budget error:', error);
    res.redirect('/budgets?error=Failed to delete budget');
  }
});

module.exports = router;

