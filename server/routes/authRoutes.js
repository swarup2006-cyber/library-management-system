const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  res.json({ message: "User registered successfully" });
});

module.exports = router;