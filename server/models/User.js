const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // User must have a name
    },
    email: {
      type: String,
      required: true,
      unique: true, // No two users can have the same email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Password must be at least 6 chars
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare passwords when logging in
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);