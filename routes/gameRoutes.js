const express = require('express');
const User = require('../models/User'); // Adjust the path as necessary
const router = express.Router();

// Middleware to authenticate user (simple example using userId from cookie)
const authenticateUser = async (req, res, next) => {
  const userId = req.cookies.userId; // Ensure you set userId in cookies upon login
  if (!userId) {
    return res.status(401).send({ message: 'Unauthorized: No user ID provided.' });
  }
  
  try {
    const user = await User.findOne({ userId: parseInt(userId, 10) });
    if (!user) {
      return res.status(401).send({ message: 'Unauthorized: User not found.' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).send({ message: 'Internal server error.' });
  }
};

// Save Game Data Route
router.post('/save-game', authenticateUser, async (req, res) => {
  const {
    playerHand,
    dealerHand,
    playerChipsAmount,
    currentBet,
    insuranceBet,
    result,
  } = req.body;

  if (
    !playerHand ||
    !dealerHand ||
    typeof playerChipsAmount !== 'number' ||
    typeof currentBet !== 'number' ||
    typeof insuranceBet !== 'number' ||
    !result
  ) {
    return res.status(400).send({ message: 'Invalid game data provided.' });
  }

  try {
    // Update user document with the latest hands and chips
    req.user.playerCards = playerHand.map(card => ({
      cardName: `${card.suit}-${card.value}`,
      points: parseInt(card.points, 10),
    }));
    req.user.dealerCards = dealerHand.map(card => ({
      cardName: `${card.suit}-${card.value}`,
      points: parseInt(card.points, 10),
    }));
    req.user.chips = playerChipsAmount;

    // Add to game history
    req.user.gameHistory.push({
      result,
      playerScore: calculateScore(playerHand),
      dealerScore: calculateScore(dealerHand),
      bet: currentBet,
      insurance: insuranceBet,
      playerChips: playerChipsAmount,
    });

    await req.user.save();
    res.status(200).send({ message: 'Game data saved successfully.' });
  } catch (error) {
    console.error('Error saving game data:', error);
    res.status(500).send({ message: 'Error saving game data.' });
  }
});

// Utility function to calculate score (ensure consistency with frontend)
const calculateScore = (hand) => {
  let score = 0;
  let aces = 0;
  hand.forEach(card => {
    let points = parseInt(card.points, 10);
    if (points === 1) { // Ace
      aces += 1;
      points = 11;
    } else if (points > 10) { // Face cards
      points = 10;
    }
    score += points;
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
};

module.exports = router;