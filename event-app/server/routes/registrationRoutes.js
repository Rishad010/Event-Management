const express = require("express");
const router = express.Router();

const {
  registerForEvent,
  markAttendance,
  getMyRegistrations,
  exportRegistrations,
} = require("../controllers/registrationController");

// Middleware to protect routes
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Only logged-in students can register
router.post("/:eventId/register", protect, registerForEvent);

// Get all registrations for the logged-in user
router.get("/my-registrations", protect, getMyRegistrations);

// Admin scans QR to mark attendance
router.post("/mark-attendance", protect, adminOnly, markAttendance);

const {
  getRegistrationsForEvent,
  getAdminSummary,
} = require("../controllers/registrationController");

// Admin-only dashboard routes
router.get("/event/:eventId", protect, adminOnly, getRegistrationsForEvent);
router.get("/summary", protect, adminOnly, getAdminSummary);

// Admin-only export route
router.get("/export", protect, adminOnly, exportRegistrations);

module.exports = router;
