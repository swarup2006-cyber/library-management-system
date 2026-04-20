const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: String,
    author: String,
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    isbn: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);
