const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  monthYear: {
    type: String,
    required: true // Format: "2025-11"
  },
  budgetAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currentSpent: {
    type: Number,
    default: 0,
    min: 0
  }
});

module.exports = mongoose.model('Budget', budgetSchema);

