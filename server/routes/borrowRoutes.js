const express = require("express");
const router = express.Router();

const {
  borrowBook,
  getBorrowedBooks,
  returnBook,
} = require("../controllers/borrowController");

const { isAuthenticated } = require("../middlewares/authMiddleware");

router.get("/borrowed", isAuthenticated, getBorrowedBooks);
router.post("/borrow", isAuthenticated, borrowBook);
router.put("/borrow/:id", isAuthenticated, returnBook);

module.exports = router;
