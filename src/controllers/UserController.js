const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");
const CommentAndRating = require("../models/CommentAndRating");

const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password || !confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The password is equal confirmPassword",
      });
    }
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    }
    const response = await UserService.loginUser(req.body);
    const { refresh_token, ...newReponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });
    return res.status(200).json({ ...newReponse, refresh_token });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const createUserCart = asyncHandler(async (req, res) => {
  const cartItem = req.body; // Assuming req.body is a single cart item
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    //check product exist
    const checkProduct = await Product.findById(cartItem._id);
    if (!checkProduct) {
      return res.status(404).json({
        status: "ERR",
        message: "Product not found",
      });
    }

    // Check if the user already has a cart
    let existingCart = await Cart.findOne({ orderby: user?._id });
    if (existingCart) {
      // If the user has an existing cart, update it
      const product = {
        _id: checkProduct._id,
        name: checkProduct.name,
        image: checkProduct.image,
        amount: cartItem.amount,
        price: checkProduct.price,
      };

      //check product exist in cart
      const productIndex = existingCart.products.findIndex(
        (product) => product._id.toString() === checkProduct._id.toString()
      );

      if (productIndex !== -1) {
        existingCart.products[productIndex].amount += cartItem.amount;
        existingCart.cartTotal = existingCart.products.reduce(
          (total, product) => total + product.price * product.amount,
          0
        );
        await existingCart.save();
      } else {
        // Add the new product to the existing cart
        existingCart.products.push(product);
        // Recalculate the cart total
        existingCart.cartTotal = existingCart.products.reduce(
          (total, product) => total + product.price * product.amount,
          0
        );
      }

      await existingCart.save();
      res.json({ status: "OK", message: "SUCCESS", data: existingCart });
    } else {
      // If the user doesn't have an existing cart, create a new one
      const product = {
        name: cartItem.name,
        image: cartItem.image,
        amount: cartItem.amount,
        price: cartItem.price,
      };

      const getPrice = await Product.findById(cartItem._id)
        .select("price")
        .exec();
      product.price = getPrice.price;

      const newCart = await new Cart({
        products: [product],
        cartTotal: product.price * product.amount,
        orderby: user?._id,
      }).save();

      user.cart = newCart._id;
      await user.save();

      res.json({ status: "OK", message: "SUCCESS", data: newCart });
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  try {
    const cart = await Cart.findOne({ orderby: _id })
      .populate("products")
      .exec();

    res.json({
      status: "OK",
      message: "SUCCESS",
      data: cart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateUserCart = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const productId = req.params.idProduct;
  const newAmount = req.body.amount;
  try {
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    if (!productId) {
      return res.status(200).json({
        status: "ERR",
        message: "The productId is required",
      });
    }
    if (!newAmount || isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid amount provided",
      });
    }
    try {
      const user = await User.findById(userId);
      const existingCart = await Cart.findOne({ orderby: user._id });
      const productIndex = existingCart.products.findIndex(
        (product) => product._id.toString() === productId
      );
      if (productIndex === -1) {
        return res
          .status(404)
          .json({ message: "Product not found in the cart" });
      }
      existingCart.products[productIndex].amount = newAmount;
      existingCart.cartTotal = existingCart.products.reduce(
        (total, product) => {
          const productTotal = product.price * product.amount;
          // Ensure productTotal is a valid number
          return isNaN(productTotal) ? total : total + productTotal;
        },
        0
      );

      await existingCart.save();
      return res.status(200).json({
        status: "OK",
        message: "update amount product in cart success",
      });
    } catch (e) {
      console.log(e, "error");
      return res.status(404).json({
        message: e,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProductUserCart = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const productId = req.params.idProduct;
  try {
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    if (!productId) {
      return res.status(200).json({
        status: "ERR",
        message: "The productId is required",
      });
    }
    try {
      const user = await User.findById(userId);
      const existingCart = await Cart.findOne({ orderby: user._id });

      const productIndex = existingCart.products.findIndex(
        (product) => product._id.toString() === productId
      );
      if (productIndex === -1) {
        return res
          .status(404)
          .json({ message: "Product not found in the cart" });
      }

      existingCart.products.splice(productIndex, 1);
      existingCart.cartTotal = existingCart.products.reduce(
        (total, product) => total + product.price * product.amount,
        0
      );

      await existingCart.save();
      return res.status(200).json({
        status: "OK",
        message: "Delete product in cart success",
      });
    } catch (e) {
      return res.status(404).json({
        status: "ERR",
        message: e,
      });
    }
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
});

const deleteAllProductInCart = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  try {
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    try {
      const user = await User.findById(userId);
      const existingCart = await Cart.findOne({ orderby: user._id });
      existingCart.products = [];
      existingCart.cartTotal = 0;
      await existingCart.save();
      return res.status(200).json({
        status: "OK",
        message: "Delete all product in cart success",
      });
    } catch (e) {
      return res.status(404).json({
        message: e,
      });
    }
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
});

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteMany = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids) {
      return res.status(200).json({
        status: "ERR",
        message: "The ids is required",
      });
    }
    const response = await UserService.deleteManyUser(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    let token = req.cookies.refresh_token;
    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const postCommentAndRating = async (req, res) => {
  const { userId, productId, comment, rating } = req.body;
  try {
    // Check if userId and productId are provided
    if (!userId || !productId) {
      throw new Error("userId and productId are required.");
    }

    // Find the user and product
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    // Create a new instance of CommentAndRating
    const newCommentAndRating = new CommentAndRating({
      userId,
      productId,
      comment,
      rating,
    });
    await newCommentAndRating.save();

    // Update user and product
    user.comment_and_rating.push(newCommentAndRating._id);
    await user.save();

    product.comment_and_rating.push(newCommentAndRating._id);
    await product.save();

    // Calculate average rating
    const comment_and_rating = await CommentAndRating.find({ productId });
    let totalRating = 0;
    comment_and_rating.forEach((item) => {
      totalRating += item.rating;
    });
    const averageRating = totalRating / comment_and_rating.length;

    product.averageRating = averageRating;
    await product.save();

    res.json({
      success: true,
      message: "Comment and rating posted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  createUser,
  loginUser,
  updateUser,
  createUserCart,
  getUserCart,
  updateUserCart,
  deleteProductUserCart,
  deleteAllProductInCart,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
  deleteMany,
  postCommentAndRating,
};
