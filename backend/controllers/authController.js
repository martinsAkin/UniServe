const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const mailsender = require("../services/mailService");
const generateOtp = require("../helpers/otpHelper");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");

const register = async (req, res) => {
  const {username, email, password } = req.body;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: "All fields are required!" });
    }

    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid input.",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const existingUser = await userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ success: false, error: "User already exists" });
    }

    if (normalizedUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username must contain at least 3 characters.",
        });
      }
  
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
      }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = new userModel({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: "studentOrstaff",
    });

    await newUser.save();
    const token = generateToken(newUser._id);

    return res.status(201).json({
        success: true,
        message: "Registration successful.",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
    });
  } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
            success: false,
            message: "Username or email already exists.",
            });
        }
  
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed.",
        });
    }
};


const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }
  
      const normalizedEmail = email.trim().toLowerCase();
  
      const user = await userModel
        .findOne({ email: normalizedEmail })
        .select("+password");
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }
  
      const token = generateToken(user._id);
  
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Login failed.",
      });
    }
};

const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }
  
      const normalizedEmail = email.trim().toLowerCase();
  
      const user = await userModel.findOne({
        email: normalizedEmail,
      });
  
      // Avoid revealing whether an account exists.
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If the account exists, a reset OTP will be sent.",
        });
      }
  
      const { otp, expiry } = generateOtp();
  
      user.resetOtp = await bcrypt.hash(otp, 10);
      user.resetOtpExpires = expiry;
      user.resetOtpAttempts = 0;
  
      // Invalidate any previously issued reset token
      user.resetToken = undefined;
      user.resetExpires = undefined;
  
      await user.save();
  
      await mailsender(
        normalizedEmail,
        "Password Reset OTP",
        `Your password reset OTP is ${otp}. It expires in 10 minutes.`
      );
  
      return res.status(200).json({
        success: true,
        message: "If the account exists, a reset OTP will be sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to process password reset.",
      });
    }
};

const verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (
        typeof email !== "string" ||
        typeof otp !== "string" ||
        !email.trim() ||
        !/^\d{6}$/.test(otp)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid email and six-digit OTP are required.",
        });
      }
  
      const user = await userModel
        .findOne({ email: email.trim().toLowerCase() })
        .select("+resetOtp +resetOtpExpires +resetOtpAttempts");
  
      if (
        !user ||
        !user.resetOtp ||
        !user.resetOtpExpires ||
        user.resetOtpExpires <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP.",
        });
      }
  
      if (user.resetOtpAttempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Too many attempts. Request a new OTP.",
        });
      }
  
      const isMatch = await bcrypt.compare(otp, user.resetOtp);
  
      if (!isMatch) {
        user.resetOtpAttempts += 1;
        await user.save();
  
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP.",
        });
      }
  
      const resetToken = crypto.randomBytes(32).toString("hex");
  
      user.resetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
  
      user.resetExpires = new Date(Date.now() + 10 * 60 * 1000);
  
      // OTP must not be reused
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
  
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully.",
        resetToken,
      });
    } catch (error) {
      console.error("OTP verification error:", error);
  
      return res.status(500).json({
        success: false,
        message: "OTP verification failed.",
      });
    }
};


const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (
      typeof resetToken !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Reset token and password are required.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and at most 72 bytes.",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await userModel
      .findOne({
        resetToken: hashedResetToken,
        resetExpires: { $gt: new Date() },
      })
      .select("+resetToken +resetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    user.password = await bcrypt.hash(password, 12);

    // Consume the reset token
    user.resetToken = undefined;
    user.resetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};


const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await userModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ error: "An error occurred while chnaging the password" });
  }
};

const getMe = async (req, res) => {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  getMe,
};