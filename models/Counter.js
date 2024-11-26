// models/Counter.js

const mongoose = require('mongoose');

// Define the Counter Schema
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    description: 'Identifier for the counter (e.g., "userId")',
  },
  sequence_value: {
    type: Number,
    default: 0,
    description: 'Current value of the sequence',
  },
});

// Create the Counter Model
const Counter = mongoose.model('Counter', counterSchema);

// Export the Counter Model
module.exports = Counter;