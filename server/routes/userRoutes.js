const express = require("express");

const { getTransactions, listUsers, toggleUserStatus } = require("../controllers/userController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", isAuthenticated, authorizeRoles("admin"), listUsers);
router.put("/:id/status", isAuthenticated, authorizeRoles("admin"), toggleUserStatus);
router.get("/transactions/all", isAuthenticated, authorizeRoles("admin"), getTransactions);

module.exports = router;
