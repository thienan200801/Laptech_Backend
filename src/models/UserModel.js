const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    phone: { type: Number, default: 0 },
    address: { type: String, default: "" },
    avatar: { type: String },
    city: { type: String },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      default: null,
    },
    comment_and_rating: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommentAndRating",
        default: null,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
