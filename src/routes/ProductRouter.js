const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleWare } = require("../middleware/authMiddleware");

router.post("/create", authMiddleWare, ProductController.createProduct);
router.put("/update/:id", authMiddleWare, ProductController.updateProduct);
router.get("/get-details/:id", ProductController.getDetailsProduct);
router.delete("/delete/:id", authMiddleWare, ProductController.deleteProduct);
router.get("/get-all", ProductController.getAllProduct);
router.get("/get-all-type", ProductController.getAllType);
router.get(
  "/get-comment-and-rating/:id",
  ProductController.getCommentAndRating
);

module.exports = router;
