const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Reminder = require('../models/Reminder');
const Transaction = require('../models/Transaction');

// List reminders
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reminders = await Reminder.find({ userId }).sort({ dueDate: 1 });
    res.render('reminders/list', { reminders });
  } catch (error) {
    console.error('List reminders error:', error);
    res.status(500).send('Error loading reminders');
  }
});

// Create reminder form
router.get('/create', isLoggedIn, (req, res) => {
  res.render('reminders/create');
});

// Create reminder handler
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { amount, description, dueDate, isRecurring } = req.body;

    // Validation
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.redirect('/reminders/create?error=Amount must be a positive number');
    }
    if (!description || description.trim().length === 0) {
      return res.redirect('/reminders/create?error=Description is required');
    }
    if (!dueDate) {
      return res.redirect('/reminders/create?error=Due date is required');
    }
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.redirect('/reminders/create?error=Invalid due date');
    }

    await Reminder.create({
      userId,
      amount: amt,
      description: description.trim(),
      dueDate: due,
      isRecurring: isRecurring === 'true'
    });

    res.redirect('/reminders?success=Reminder created');
  } catch (error) {
    console.error('Create reminder error:', error);
    res.redirect('/reminders/create?error=Failed to create reminder');
  }
});

// Mark reminder as paid
router.post('/:id/paid', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reminder = await Reminder.findOne({ _id: req.params.id, userId });
    if (!reminder) {
      return res.status(404).send('Reminder not found');
    }

    reminder.isPaid = true;
    await reminder.save();

    // If recurring, create next reminder
    if (reminder.isRecurring) {
      const nextDue = new Date(reminder.dueDate);
      nextDue.setMonth(nextDue.getMonth() + 1);
      await Reminder.create({
        userId,
        amount: reminder.amount,
        description: reminder.description,
        dueDate: nextDue,
        isRecurring: true
      });
    }

    res.redirect('/reminders?success=Reminder marked as paid');
  } catch (error) {
    console.error('Mark paid error:', error);
    res.redirect('/reminders?error=Failed to update reminder');
  }
});

// Update reminder form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reminder = await Reminder.findOne({ _id: req.params.id, userId });
    if (!reminder) {
      return res.status(404).send('Reminder not found');
    }
    res.render('reminders/edit', { reminder });
  } catch (error) {
    console.error('Edit reminder form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Update reminder handler
router.post('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reminder = await Reminder.findOne({ _id: req.params.id, userId });
    if (!reminder) {
      return res.status(404).send('Reminder not found');
    }

    const { amount, description, dueDate, isRecurring } = req.body;

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.redirect(`/reminders/${req.params.id}/edit?error=Amount must be a positive number`);
    }
    if (!description || description.trim().length === 0) {
      return res.redirect(`/reminders/${req.params.id}/edit?error=Description is required`);
    }
    if (!dueDate) {
      return res.redirect(`/reminders/${req.params.id}/edit?error=Due date is required`);
    }
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.redirect(`/reminders/${req.params.id}/edit?error=Invalid due date`);
    }

    reminder.amount = amt;
    reminder.description = description.trim();
    reminder.dueDate = due;
    reminder.isRecurring = isRecurring === 'true';
    await reminder.save();

    res.redirect('/reminders?success=Reminder updated');
  } catch (error) {
    console.error('Update reminder error:', error);
    res.redirect(`/reminders/${req.params.id}/edit?error=Failed to update`);
  }
});

// Delete reminder
router.post('/:id/delete', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reminder = await Reminder.findOne({ _id: req.params.id, userId });
    if (!reminder) {
      return res.status(404).send('Reminder not found');
    }

    await Reminder.findByIdAndDelete(req.params.id);
    res.redirect('/reminders?success=Reminder deleted');
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.redirect('/reminders?error=Failed to delete reminder');
  }
});

module.exports = router;

