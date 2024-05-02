const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
  authMiddleWare,
  authUserMiddleWare,
} = require("../middleware/authMiddleware");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.post(
  "/cart-user/:id",
  authUserMiddleWare,
  userController.createUserCart
);
router.get("/get-cart-user/:id", userController.getUserCart);

router.put(
  "/update-cart-user/:id/:idProduct",
  authUserMiddleWare,
  userController.updateUserCart
);

router.delete(
  "/delete-cart-user/:id/:idProduct",
  authUserMiddleWare,
  userController.deleteProductUserCart
);

router.delete(
  "/delete-all-cart-user/:id",
  authUserMiddleWare,
  userController.deleteAllProductInCart
);

router.get("/get-cart-user/:id", userController.getUserCart);

router.put("/update-user/:id", authUserMiddleWare, userController.updateUser);
router.delete("/delete-user/:id", authMiddleWare, userController.deleteUser);
router.get("/getAll", authMiddleWare, userController.getAllUser);
router.get(
  "/get-details/:id",
  authUserMiddleWare,
  userController.getDetailsUser
);
router.post("/refresh-token", userController.refreshToken);
router.post("/delete-many", authMiddleWare, userController.deleteMany);
router.post(
  "/post-comment-and-rating/:id",
  userController.postCommentAndRating
);

module.exports = router;
