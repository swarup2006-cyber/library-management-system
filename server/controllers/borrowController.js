const Borrow = require("../models/borrowModel");
const Book = require("../models/bookModel");
const { BORROW_WINDOW_DAYS, serializeBorrowRecord } = require("../utils/borrowMetrics");

const restoreBookStock = async (bookId) => {
  const book = await Book.findById(bookId);

  if (!book) {
    return;
  }

  const totalStock = book.totalStock || 1;
  const currentStock =
    typeof book.availableStock === "number"
      ? book.availableStock
      : book.available
        ? totalStock
        : 0;

  book.availableStock = Math.min(currentStock + 1, totalStock);
  book.available = book.availableStock > 0;
  await book.save();
};

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

  const availableStock =
    typeof book.availableStock === "number"
      ? book.availableStock
      : book.available
        ? book.totalStock || 1
        : 0;

  if (availableStock <= 0) {
    return res.status(400).json({ message: "This book is currently out of stock." });
  }

  const record = await Borrow.create({
    user: req.user._id,
    book: bookId,
    borrowDate: Date.now(),
    dueDate: new Date(Date.now() + BORROW_WINDOW_DAYS * 24 * 60 * 60 * 1000),
  });

  book.totalStock = book.totalStock || 1;
  book.availableStock = Math.max(availableStock - 1, 0);
  book.available = book.availableStock > 0;
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

const requestReturnInternal = async (record) => {
  if (record.returnDate) {
    return { status: 400, message: "This book has already been returned." };
  }

  if (record.returnRequestedAt) {
    return { status: 400, message: "A return request is already pending for this book." };
  }

  record.returnRequestedAt = Date.now();
  await record.save();

  return {
    status: 200,
    message: "Return request sent to admin for approval.",
  };
};

const approveReturnInternal = async (record) => {
  if (record.returnDate) {
    return { status: 400, message: "This book has already been returned." };
  }

  if (!record.returnRequestedAt) {
    return { status: 400, message: "The student has not requested a return yet." };
  }

  record.returnDate = Date.now();
  const serializedRecord = serializeBorrowRecord(record);
  record.fineAtReturn = serializedRecord.fineAmount;
  await record.save();
  await restoreBookStock(record.book);

  return {
    status: 200,
    message: serializedRecord.fineAmount
      ? `Return approved. Fine due: ${serializedRecord.fineAmount}.`
      : "Return approved successfully.",
  };
};

exports.requestReturn = async (req, res) => {
  const record = await Borrow.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!record) {
    return res.status(404).json({ message: "Borrow record not found." });
  }

  const result = await requestReturnInternal(record);
  return res.status(result.status).json({ success: result.status < 400, message: result.message });
};

exports.approveReturn = async (req, res) => {
  const record = await Borrow.findById(req.params.id);

  if (!record) {
    return res.status(404).json({ message: "Borrow record not found." });
  }

  const result = await approveReturnInternal(record);
  return res.status(result.status).json({ success: result.status < 400, message: result.message });
};

// Compatibility endpoint: students request return, admins approve return.
exports.returnBook = async (req, res) => {
  if (req.user.role === "admin") {
    return exports.approveReturn(req, res);
  }

  return exports.requestReturn(req, res);
};
