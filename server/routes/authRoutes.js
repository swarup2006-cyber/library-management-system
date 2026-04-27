const express = require("express");
const router = express.Router();

const {
  register,
  verifyOtp,
  requestPasswordReset,
  verifyPasswordResetOtp,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/verify", verifyPasswordResetOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticated, getMe);
router.put("/me", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);

module.exports = router;
