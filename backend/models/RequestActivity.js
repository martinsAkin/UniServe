
const mongoose = require("mongoose");

const requestActivitySchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "created",
        "assigned",
        "reassigned",
        "started",
        "completed",
        "cancelled",
        "updated",
      ],
      required: true,
    },

    fromStatus: {
      type: String,
      default: null,
    },

    toStatus: {
      type: String,
      default: null,
    },

    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

requestActivitySchema.index({ request: 1, createdAt: -1 });

module.exports = mongoose.model(
  "RequestActivity",
  requestActivitySchema
);
