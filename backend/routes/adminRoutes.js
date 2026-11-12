
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
  getAllUsers,
  getUserById,
  getDashboardStats,
  getOfficerWorkload,
  getAllRequests,
  getAdminRequestById,
  getRequestReport,
} = require("../controllers/adminController");

const {
  updateUserRole,
  updateUserStatus,
} = require("../controllers/userController");

const { getRequestHistory } = require("../controllers/requestActivityController");

// Protect every admin endpoint
router.use(authMiddleware);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.patch("/users/:userId/role", authorize("admin"), updateUserRole);
router.patch("/users/:userId/status", updateUserStatus);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/officers", getOfficerWorkload);

// Request monitoring
router.get("/requests", getAllRequests);
router.get("/requests/:id/history", getRequestHistory);
router.get("/requests/:id", getAdminRequestById);
router.get("/reports/requests", getRequestReport);

module.exports = router;
