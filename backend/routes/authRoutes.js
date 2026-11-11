
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.patch("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
