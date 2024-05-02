const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    type: { type: String, required: true },
    company: { type: String },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    description: { type: String },
    averageRating: { type: Number, default: 0 },
    discount: { type: Number },
    selled: { type: Number },
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
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
