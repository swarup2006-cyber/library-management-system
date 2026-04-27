const mongoose = require("mongoose");

const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      required: true,
    },
    purpose: {
      type: String,
      default: "password-reset",
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

passwordResetOtpSchema.index(
  { email: 1, role: 1, purpose: 1 },
  { unique: true }
);

module.exports = mongoose.model("PasswordResetOtp", passwordResetOtpSchema);
