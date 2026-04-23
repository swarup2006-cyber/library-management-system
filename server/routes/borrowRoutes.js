const express = require("express");
const router = express.Router();

const {
  borrowBook,
  getBorrowedBooks,
  getStudentIssues,
  requestReturn,
  approveReturn,
  returnBook,
} = require("../controllers/borrowController");

const { authorizeRoles, isAuthenticated } = require("../middlewares/authMiddleware");

router.get(
  "/issues/student/:studentId",
  isAuthenticated,
  authorizeRoles("admin"),
  getStudentIssues
);
router.get("/borrowed", isAuthenticated, getBorrowedBooks);
router.post("/borrow", isAuthenticated, borrowBook);
router.put("/borrow/:id/request-return", isAuthenticated, requestReturn);
router.put("/borrow/:id/approve-return", isAuthenticated, authorizeRoles("admin"), approveReturn);
router.put("/borrow/:id", isAuthenticated, returnBook);

module.exports = router;
