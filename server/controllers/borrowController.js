const Borrow = require("../models/borrowModel");
const Book = require("../models/bookModel");
const { BORROW_WINDOW_DAYS, serializeBorrowRecord } = require("../utils/borrowMetrics");

// Borrow book
exports.borrowBook = async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ message: "Book id is required." });
  }

  const book = await Book.findById(bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.available) {
    return res.status(400).json({ message: "This book is already borrowed." });
  }

  const record = await Borrow.create({
    user: req.user._id,
    book: bookId,
    borrowDate: Date.now(),
    dueDate: new Date(Date.now() + BORROW_WINDOW_DAYS * 24 * 60 * 60 * 1000),
  });

  book.available = false;
  await book.save();

  const populatedRecord = await Borrow.findById(record._id).populate("book");

  res.status(201).json({
    success: true,
    record: serializeBorrowRecord(populatedRecord),
  });
};

exports.getBorrowedBooks = async (req, res) => {
  const records = await Borrow.find({ user: req.user._id })
    .populate("book")
    .sort({ borrowDate: -1 });

  res.json(records.map((record) => serializeBorrowRecord(record)));
};

// Return book
exports.returnBook = async (req, res) => {
  const record = await Borrow.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!record) {
    return res.status(404).json({ message: "Borrow record not found." });
  }

  if (record.returnDate) {
    return res.status(400).json({ message: "This book has already been returned." });
  }

  record.returnDate = Date.now();
  const serializedRecord = serializeBorrowRecord(record);
  record.fineAtReturn = serializedRecord.fineAmount;
  await record.save();

  await Book.findByIdAndUpdate(record.book, { available: true });

  res.json({
    success: true,
    message: serializedRecord.fineAmount
      ? `Book returned. Fine due: ${serializedRecord.fineAmount}.`
      : "Book returned",
  });
};
