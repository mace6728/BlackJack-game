// routes/userRoutes.js
const express = require('express');
const User = require('../models/User'); // Adjust the path as necessary

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const { userName, password } = req.body;

  // Basic input validation
  if (!userName || !password) {
    return res.status(400).send({ message: 'Username and password are required.' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(409).send({ message: 'Username already exists.' });
    }

    // Create and save the new user
    const newUser = new User({ userName, password });
    await newUser.save();

    res.status(201).send({
      message: 'User registered successfully!',
      userId: newUser.userId,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ message: 'Error registering user.' });
  }
});

module.exports = router;