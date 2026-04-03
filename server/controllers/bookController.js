const Book = require("../models/bookModel");

// Add book
exports.addBook = async (req, res) => {
  const book = await Book.create(req.body);
  res.json(book);
};

// Get all books
exports.getAllBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};

// Delete book
exports.deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted" });
};