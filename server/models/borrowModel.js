const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
  book: { type: mongoose.Schema.ObjectId, ref: "Book" },
  borrowDate: Date,
  returnDate: Date,
});

module.exports = mongoose.model("Borrow", borrowSchema);