
const express = require("express");
const router = express.Router();

const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  assignRequest,
  updateRequestStatus,
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

router.use(authMiddleware);

router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.patch("/:id/assign", authorize("admin"), assignRequest);
router.patch("/:id/status", updateRequestStatus);
router.patch("/:id", updateRequest);
router.delete("/:id", deleteRequest);

module.exports = router;
