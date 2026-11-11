const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["studentOrstaff", "maintenanceOfficer", "admin"],
      default: "studentOrstaff",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetExpires: {
      type: Date,
      select: false,
    },
    resetOtp: {
      type: String,
      select: false,
    }, 
    resetOtpExpires: {
      type: Date,
      select: false,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
