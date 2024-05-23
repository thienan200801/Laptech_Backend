const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

const commentAndRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    comment: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
  }
);

const CommentAndRating = mongoose.model(
  "CommentAndRating",
  commentAndRatingSchema
);
module.exports = CommentAndRating;
