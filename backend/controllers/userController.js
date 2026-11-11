const mongoose = require("mongoose");
const userModel = require("../models/User");


const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    const allowedRoles = ["studentOrstaff", "maintenanceOfficer", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    // Prevent accidental self-demotion or self-promotion.
    if (req.user._id.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};


const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate user ID
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Validate account status
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value.",
      });
    }

    // Find the target user
    const targetUser = await userModel.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent administrators from deactivating themselves
    if (
      !isActive &&
      targetUser._id.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    // No update is necessary if the account already has this status
    if (targetUser.isActive === isActive) {
      return res.status(200).json({
        success: true,
        message: `User account is already ${isActive ? "active" : "inactive"}.`,
        user: {
          _id: targetUser._id,
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role,
          isActive: targetUser.isActive,
        },
      });
    }

    // Prevent deactivation of the last active administrator
    if (!isActive && targetUser.role === "admin") {
      const activeAdminCount = await userModel.countDocuments({
        role: "admin",
        isActive: { $ne: false },
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate the last active administrator.",
        });
      }
    }

    // Update account status
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: { isActive } },
      {
        new: true,
        runValidators: true,
      }
    ).select("username email role isActive createdAt");

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? "reactivated" : "deactivated"} successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user account status.",
    });
  }
};


module.exports = {
  updateUserRole,
  updateUserStatus,
};