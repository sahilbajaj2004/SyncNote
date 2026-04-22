const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || null,
        profilePic: user.profilePic || null,
      },
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || null,
        profilePic: user.profilePic || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOOGLE OAuth — step 1
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GOOGLE OAuth — step 2
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`http://localhost:5173/login?error=google_failed`);
    }

    const token = generateToken(user._id);
    const userData = JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || null,
      profilePic: user.profilePic || null,
    });

    res.redirect(
      `http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(userData)}`
    );
  })(req, res, next);
});

// SET USERNAME
router.post("/setup-username", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = req.body;

    if (!username) return res.status(400).json({ error: "Username is required" });
    if (username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) return res.status(400).json({ error: "Username already taken" });

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { username: username.toLowerCase() },
      { new: true }
    );

    res.json({
      message: "Username set successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK USERNAME AVAILABILITY
router.get("/check-username/:username", async (req, res) => {
  try {
    const existing = await User.findOne({
      username: req.params.username.toLowerCase(),
    });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;