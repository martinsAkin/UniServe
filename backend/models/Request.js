const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "in-progress", "cancelled", "completed"],
      default: "active",
    },
    completionNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);