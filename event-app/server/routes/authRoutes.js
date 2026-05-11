const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updatePassword,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/update-password", updatePassword);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
