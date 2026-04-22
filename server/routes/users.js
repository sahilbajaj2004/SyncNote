const express = require("express");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, username, password, profilePic } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update Name
    if (name) {
      user.name = name;
    }

    // Update Password (hashed automatically by pre-save hook)
    if (password) {
      user.password = password;
    }

    // Update Profile Pic to Cloudinary
    if (profilePic && profilePic.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "syncnote_profiles",
        width: 400,
        height: 400,
        crop: "fill",
      });
      user.profilePic = uploadResponse.secure_url;
    }

    // Update Username
    if (username && username.toLowerCase() !== user.username) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (user.usernameLastChanged && user.usernameLastChanged > oneYearAgo) {
        return res.status(400).json({ error: "You can only change your username once a year." });
      }

      // Check if available
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "Username already taken." });
      }

      user.username = username.toLowerCase();
      user.usernameLastChanged = new Date();
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
