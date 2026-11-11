
// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/authMiddleware");
// const authorize = require("../middleware/authorize");
// const userController = require("../controllers/userController");

// // Every route in this file requires authentication
// router.use(authMiddleware);

// // Admin-only routes
// router.get(
//   "/",
//   authorize("admin"),
//   userController.getAllUsers
// );

// router.patch(
//   "/:userId/role",
//   authorize("admin"),
//   userController.updateUserRole
// );

// module.exports = router;
