// models/User.js
const mongoose = require('mongoose');
const Counter = require('./Counter'); // Adjust the path as necessary

const CardSchema = new mongoose.Schema({
  cardName: { type: String, required: true },
  points: { type: Number, required: true },
});

const GameHistorySchema = new mongoose.Schema({
  result: { type: String, required: true },
  playerScore: { type: Number, required: true },
  dealerScore: { type: Number, required: true },
  bet: { type: Number, required: true },
  insurance: { type: Number, default: 0 },
  playerChips: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  chips: { type: Number, default: 1000 },
  playerCards: [CardSchema],
  dealerCards: [CardSchema],
  gameHistory: [GameHistorySchema],
});

// Pre-save middleware to assign unique sequential userId
UserSchema.pre('save', async function(next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      doc.userId = counter.sequence_value;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;