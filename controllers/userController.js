// controllers/userController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Register a new user
exports.registerUser = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { userName, password } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      userName,
      password: hashedPassword,
      // Other fields can be initialized here if needed
    });
    
    // Save user to database
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully!', userId: newUser.userId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { userName, password } = req.body;
  
  try {
    // Find user by username
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    
    // Set userId in cookie (for simple session management)
    res.cookie('userId', user.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'Strict',
    });
    
    res.status(200).json({ message: 'Login successful!', userId: user.userId });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};