const crypto = require("crypto");
const User = require("../models/userModel");
const PasswordResetOtp = require("../models/passwordResetOtpModel");
const sendToken = require("../utils/sendToken");
const { sendPasswordResetOtpEmail } = require("../utils/mailer");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const RESET_OTP_WINDOW_MS = 10 * 60 * 1000;
const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");
const serializeAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
  isVerified: user.isVerified,
  phone: user.phone || "",
  address: user.address || "",
  department: user.department || "",
  studentId: user.studentId || "",
  bio: user.bio || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Register
exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    adminInviteCode,
    phone,
    address,
    department,
    studentId,
    bio,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const requestedRole = role === "admin" ? "admin" : "user";
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser && existingUser.isVerified) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  if (requestedRole === "admin") {
    const verifiedAdminCount = await User.countDocuments({
      role: "admin",
      isVerified: true,
    });
    const configuredInviteCode = process.env.ADMIN_SIGNUP_CODE;
    const hasValidInviteCode =
      configuredInviteCode && adminInviteCode === configuredInviteCode;

    if (verifiedAdminCount > 0 && !hasValidInviteCode) {
      return res.status(403).json({
        message:
          "Admin signup requires a valid invite code after the first administrator is created.",
      });
    }
  }

  const otp = generateOtp();
  const user = existingUser || new User();

  user.name = name.trim();
  user.email = normalizedEmail;
  user.password = password;
  user.role = requestedRole;
  user.phone = phone?.trim() || "";
  user.address = address?.trim() || "";
  user.department = department?.trim() || "";
  user.studentId = requestedRole === "admin" ? "" : studentId?.trim() || "";
  user.bio =
    bio?.trim() ||
    (requestedRole === "admin"
      ? "Administrator account."
      : "Library member waiting for verification.");
  user.isVerified = false;
  user.verificationOtp = otp;
  user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  console.log(`OTP for ${normalizedEmail}: ${otp}`);

  res.status(201).json({
    success: true,
    message: "Registration successful. Verify your account with the OTP.",
    email: normalizedEmail,
    otpCode: otp,
    devOtp: otp,
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: "Account not found." });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Account is already verified." });
  }

  if (user.verificationOtp !== otp.trim()) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  if (!user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
    return res.status(400).json({ message: "OTP has expired. Register again to get a new code." });
  }

  user.isVerified = true;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Account verified successfully." });
};

exports.requestPasswordReset = async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role === "admin" ? "admin" : "student";
  const otp = generateOtp();

  await PasswordResetOtp.findOneAndUpdate(
    {
      email: normalizedEmail,
      role: normalizedRole,
      purpose: "password-reset",
    },
    {
      email: normalizedEmail,
      role: normalizedRole,
      purpose: "password-reset",
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + RESET_OTP_WINDOW_MS),
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      returnDocument: "after",
    }
  );

  await sendPasswordResetOtpEmail({
    to: normalizedEmail,
    otp,
    role: normalizedRole,
  });

  res.json({
    success: true,
    message: "A password reset OTP has been sent to your email address.",
    email: normalizedEmail,
    otpCode: otp,
  });
};

exports.verifyPasswordResetOtp = async (req, res) => {
  const { email, otp, role, password } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role === "admin" ? "admin" : "student";
  const resetOtp = await PasswordResetOtp.findOne({
    email: normalizedEmail,
    role: normalizedRole,
    purpose: "password-reset",
  });

  if (!resetOtp) {
    return res.status(400).json({
      message: "No active reset OTP was found. Request a new OTP and try again.",
    });
  }

  if (resetOtp.expiresAt < new Date()) {
    await resetOtp.deleteOne();
    return res.status(400).json({
      message: "The reset OTP has expired. Request a new OTP and try again.",
    });
  }

  if (resetOtp.otpHash !== hashOtp(otp.trim())) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  if (password) {
    const userRole = normalizedRole === "admin" ? "admin" : "user";
    const user = await User.findOne({
      email: normalizedEmail,
      role: userRole,
    });

    if (!user) {
      return res.status(404).json({ message: "No matching account was found for this portal." });
    }

    user.password = password.trim();
    await user.save();
  }

  await resetOtp.deleteOne();

  res.json({
    success: true,
    message: password ? "Password reset complete." : "OTP verified successfully.",
  });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: "Your account has been blocked." });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "Verify your account before logging in." });
  }

  sendToken(user, 200, res);
};

// Logout
exports.logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.json({ message: "Logged out" });
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: serializeAuthUser(req.user),
  });
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, address, department, studentId, bio } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: req.user._id },
  });

  if (existingUser) {
    return res.status(400).json({ message: "Another account already uses this email." });
  }

  req.user.name = name.trim();
  req.user.email = normalizedEmail;
  req.user.phone = phone?.trim() || "";
  req.user.address = address?.trim() || "";
  req.user.department = department?.trim() || "";
  req.user.studentId = req.user.role === "admin" ? "" : studentId?.trim() || req.user.studentId || "";
  req.user.bio = bio?.trim() || "";
  await req.user.save();

  res.json({
    success: true,
    message: "Profile updated successfully.",
    user: serializeAuthUser(req.user),
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required." });
  }

  const user = await User.findById(req.user._id);

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }

  user.password = newPassword.trim();
  await user.save();

  res.json({ success: true, message: "Password changed successfully." });
};
