const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

// Helper function to create JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Block login if user registered with Google
    if (!user.password) {
      return res.status(400).json({ error: "Please sign in with Google" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOOGLE OAuth — step 1: redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GOOGLE OAuth — step 2: Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const user = JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });

    // Redirect to frontend with token and user in query params
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(user)}`
    );
  }
);

module.exports = router;