const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  deleteBook,
} = require("../controllers/bookController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/authMiddleware");

router.post("/", isAuthenticated, authorizeRoles("admin"), addBook);
router.get("/", getAllBooks);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteBook);

module.exports = router;
