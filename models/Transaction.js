const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  balanceAfter: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

