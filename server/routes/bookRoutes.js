const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  deleteBook,
} = require("../controllers/bookController");

router.post("/", addBook);
router.get("/", getAllBooks);
router.delete("/:id", deleteBook);

module.exports = router;