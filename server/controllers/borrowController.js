const Borrow = require("../models/borrowModel");

// Borrow book
exports.borrowBook = async (req, res) => {
  const record = await Borrow.create({
    user: req.user._id,
    book: req.body.bookId,
    borrowDate: Date.now(),
  });

  res.json(record);
};

// Return book
exports.returnBook = async (req, res) => {
  const record = await Borrow.findById(req.params.id);

  record.returnDate = Date.now();
  await record.save();

  res.json({ message: "Book returned" });
};
