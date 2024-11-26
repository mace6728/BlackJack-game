// controllers/gameController.js
const User = require('../models/User');

exports.saveGameData = async (req, res) => {
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
    // Update user document
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
};

// utils/calculateScore.js
exports.calculateScore = (hand) => {
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