const express = require("express");
const router = express.Router();

const {
  borrowBook,
  returnBook,
} = require("../controllers/borrowController");

const { isAuthenticated } = require("../middlewares/authMiddleware");

router.post("/", isAuthenticated, borrowBook);
router.put("/:id", isAuthenticated, returnBook);

module.exports = router;