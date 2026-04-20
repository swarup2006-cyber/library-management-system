const Book = require("../models/bookModel");

// Add book
exports.addBook = async (req, res) => {
  const { title, author, publisher, category, isbn, description, totalStock } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: "Title and author are required." });
  }

  const normalizedStock = Math.max(Number(totalStock) || 1, 1);
  const book = await Book.create({
    title: title.trim(),
    author: author.trim(),
    publisher: publisher?.trim() || "",
    category: category?.trim() || "General",
    isbn: isbn?.trim() || "",
    description: description?.trim() || "",
    totalStock: normalizedStock,
    availableStock: normalizedStock,
    available: normalizedStock > 0,
  });

  res.status(201).json({ success: true, book });
};

// Get all books
exports.getAllBooks = async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1, title: 1 });
  res.json({ success: true, books });
};

exports.updateBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const {
    title,
    author,
    publisher,
    category,
    isbn,
    description,
    totalStock,
    availableStock,
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: "Title and author are required." });
  }

  const nextTotalStock = Math.max(Number(totalStock) || book.totalStock || 1, 1);
  const nextAvailableStock = Math.min(
    Math.max(Number(availableStock) || 0, 0),
    nextTotalStock
  );

  book.title = title.trim();
  book.author = author.trim();
  book.publisher = publisher?.trim() || "";
  book.category = category?.trim() || "General";
  book.isbn = isbn?.trim() || "";
  book.description = description?.trim() || "";
  book.totalStock = nextTotalStock;
  book.availableStock = nextAvailableStock;
  book.available = nextAvailableStock > 0;

  await book.save();

  res.json({ success: true, message: "Book updated successfully.", book });
};

// Delete book
exports.deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  res.json({ success: true, message: "Book deleted" });
};
