const Book = require("../models/bookModel");

// Add book
exports.addBook = async (req, res) => {
  const { title, author, category, isbn, description } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: "Title and author are required." });
  }

  const book = await Book.create({
    title: title.trim(),
    author: author.trim(),
    category: category?.trim() || "General",
    isbn: isbn?.trim() || "",
    description: description?.trim() || "",
  });

  res.status(201).json({ success: true, book });
};

// Get all books
exports.getAllBooks = async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1, title: 1 });
  res.json({ success: true, books });
};

// Delete book
exports.deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  res.json({ success: true, message: "Book deleted" });
};
