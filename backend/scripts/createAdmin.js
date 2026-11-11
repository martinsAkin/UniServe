const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin credentials are missing from your .env file.");
    }

    const existingUser = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    if (existingUser) {
      existingUser.role = "admin";
      existingUser.isActive = true;
      await existingUser.save();

      console.log("Existing user successfully promoted to admin.");
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

      await User.create({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      console.log("Admin account created successfully.");
    }
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
