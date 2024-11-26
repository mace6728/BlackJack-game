// server.js
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const connectDB = require('./database/db'); // Import the connectDB function
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/users', userRoutes);
app.use('/', gameRoutes);

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  chips: { type: Number, default: 100 }, // Default chips
  playerCards: [
    {
      cardName: String,
      points: Number,
    },
  ],
  dealerCards: [
    {
      cardName: String,
      points: Number,
    },
  ],
});

// Counter Schema for sequential userId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

const User = mongoose.model("User", UserSchema);

// Registration Route
app.post("/users/register", async (req, res) => {
  const { userName, password } = req.body;

  // Basic input validation
  if (!userName || !password) {
    return res
      .status(400)
      .send({ message: "Username and password are required." });
  }

  try {
    // Check if username already exists
    const existingUser = UserSchema.pre("save", async function (next) {
      const doc = this;
      if (doc.isNew) {
        try {
          const counter = await Counter.findByIdAndUpdate(
            { _id: "userId" },
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
    if (existingUser) {
      return res.status(409).send({ message: "Username already exists." });
    }

    // Create and save the new user without hashing the password
    const newUser = new User({ userId, userName, password, chips, playerCards, dealerCards });
    await newUser.save();

    res
      .status(201)
      .send({
        message: "User registered successfully!",
        userId: newUser.userId,
      });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "Error registering user." });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
