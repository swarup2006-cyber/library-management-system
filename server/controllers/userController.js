const Borrow = require("../models/borrowModel");
const User = require("../models/userModel");
const { serializeBorrowRecord } = require("../utils/borrowMetrics");

exports.listUsers = async (req, res) => {
  const users = await User.find()
    .select("_id name email role isBlocked isVerified createdAt")
    .sort({ role: -1, name: 1 });

  res.json({ success: true, users });
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
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
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
