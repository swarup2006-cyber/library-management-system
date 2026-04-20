const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  deleteBook,
  updateBook,
} = require("../controllers/bookController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/authMiddleware");

router.post("/", isAuthenticated, authorizeRoles("admin"), addBook);
router.get("/", getAllBooks);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateBook);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteBook);

module.exports = router;
