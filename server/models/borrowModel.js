const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    // Canonical storage keys stay compatible with the existing data model.
    user: { type: mongoose.Schema.ObjectId, ref: "User", alias: "studentId" },
    book: { type: mongoose.Schema.ObjectId, ref: "Book", alias: "bookId" },
    borrowDate: { type: Date, alias: "issueDate" },
    dueDate: Date,
    // A student can only request a return. Admin approval closes the loan.
    returnRequestedAt: Date,
    returnDate: Date,
    fineAtReturn: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Borrow", borrowSchema);
