const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "University Maintenance API is running.",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Server & Database

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing.");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");
    console.log(`Database: ${mongoose.connection.name}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();

