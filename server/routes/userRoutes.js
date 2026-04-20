const express = require("express");

const {
  createUser,
  deleteUser,
  getTransactions,
  listUsers,
  toggleUserStatus,
  updateUser,
} = require("../controllers/userController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/transactions/all", isAuthenticated, authorizeRoles("admin"), getTransactions);
router.get("/", isAuthenticated, authorizeRoles("admin"), listUsers);
router.post("/", isAuthenticated, authorizeRoles("admin"), createUser);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateUser);
router.put("/:id/status", isAuthenticated, authorizeRoles("admin"), toggleUserStatus);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);

module.exports = router;
