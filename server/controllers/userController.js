const Borrow = require("../models/borrowModel");
const User = require("../models/userModel");
const { serializeBorrowRecord } = require("../utils/borrowMetrics");

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

exports.listUsers = async (req, res) => {
  const users = await User.find()
    .select("_id name email role isBlocked isVerified createdAt")
    .sort({ role: -1, name: 1 });

  res.json({ success: true, users });
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, isBlocked } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role === "admin" ? "admin" : "user",
    isBlocked: Boolean(isBlocked),
    isVerified: true,
  });

  res.status(201).json({
    success: true,
    message: "User added successfully.",
    user: serializeUser(user),
  });
};

exports.updateUser = async (req, res) => {
  const { name, email, role, isBlocked, isVerified } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: user._id },
  });

  if (existingUser) {
    return res.status(400).json({ message: "Another account already uses this email." });
  }

  user.name = name.trim();
  user.email = normalizedEmail;
  user.role = role === "admin" ? "admin" : "user";
  if (user._id.toString() === req.user._id.toString() && Boolean(isBlocked)) {
    return res.status(400).json({ message: "You cannot block your own account." });
  }

  user.isBlocked = Boolean(isBlocked);
  user.isVerified = Boolean(isVerified);
  await user.save();

  res.json({
    success: true,
    message: "User updated successfully.",
    user: serializeUser(user),
  });
};

exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot block your own account." });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    message: user.isBlocked ? "User blocked successfully." : "User activated successfully.",
    user: serializeUser(user),
  });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account." });
  }

  const activeBorrow = await Borrow.findOne({
    user: user._id,
    returnDate: { $exists: false },
  });

  if (activeBorrow) {
    return res.status(400).json({ message: "This user has active borrowed books. Block the account instead." });
  }

  await User.findByIdAndDelete(user._id);

  res.json({ success: true, message: "User deleted successfully." });
};

exports.getTransactions = async (req, res) => {
  const records = await Borrow.find()
    .populate("user", "name email role")
    .populate("book")
    .sort({ borrowDate: -1 });

  res.json({
    success: true,
    transactions: records.map((record) => serializeBorrowRecord(record)),
  });
};
