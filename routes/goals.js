const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Goal = require('../models/Goal');

// List goals
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const goals = await Goal.find({ userId }).sort({ deadline: 1 });
    res.render('goals/list', { goals });
  } catch (error) {
    console.error('List goals error:', error);
    res.status(500).send('Error loading goals');
  }
});

// Create goal form
router.get('/create', isLoggedIn, (req, res) => {
  res.render('goals/create');
});

// Create goal handler
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { targetAmount, deadline, description } = req.body;

    // Validation
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.redirect('/goals/create?error=Target amount must be a positive number');
    }
    if (!deadline) {
      return res.redirect('/goals/create?error=Deadline is required');
    }
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.redirect('/goals/create?error=Deadline must be in the future');
    }
    if (!description || description.trim().length === 0) {
      return res.redirect('/goals/create?error=Description is required');
    }

    await Goal.create({
      userId,
      targetAmount: amount,
      deadline: deadlineDate,
      description: description.trim(),
      currentProgress: 0
    });

    res.redirect('/goals?success=Goal created');
  } catch (error) {
    console.error('Create goal error:', error);
    res.redirect('/goals/create?error=Failed to create goal');
  }
});

// Update goal form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const goal = await Goal.findOne({ _id: req.params.id, userId });
    if (!goal) {
      return res.status(404).send('Goal not found');
    }
    res.render('goals/edit', { goal });
  } catch (error) {
    console.error('Edit goal form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Update goal handler
router.post('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const goal = await Goal.findOne({ _id: req.params.id, userId });
    if (!goal) {
      return res.status(404).send('Goal not found');
    }

    const { targetAmount, deadline, description } = req.body;

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.redirect(`/goals/${req.params.id}/edit?error=Target amount must be a positive number`);
    }
    if (!deadline) {
      return res.redirect(`/goals/${req.params.id}/edit?error=Deadline is required`);
    }
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.redirect(`/goals/${req.params.id}/edit?error=Deadline must be in the future`);
    }
    if (!description || description.trim().length === 0) {
      return res.redirect(`/goals/${req.params.id}/edit?error=Description is required`);
    }

    goal.targetAmount = amount;
    goal.deadline = deadlineDate;
    goal.description = description.trim();
    await goal.save();

    res.redirect('/goals?success=Goal updated');
  } catch (error) {
    console.error('Update goal error:', error);
    res.redirect(`/goals/${req.params.id}/edit?error=Failed to update`);
  }
});

// Delete goal
router.post('/:id/delete', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const goal = await Goal.findOne({ _id: req.params.id, userId });
    if (!goal) {
      return res.status(404).send('Goal not found');
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.redirect('/goals?success=Goal deleted');
  } catch (error) {
    console.error('Delete goal error:', error);
    res.redirect('/goals?error=Failed to delete goal');
  }
});

module.exports = router;

