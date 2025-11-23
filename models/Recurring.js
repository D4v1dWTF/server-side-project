const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal']
  },
  accountType: {
    type: String,
    required: true,
    enum: ['current', 'savings']
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly']
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31
  },
  lastAppliedDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Recurring', recurringSchema);

