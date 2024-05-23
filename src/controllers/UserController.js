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
const createUserCart = async (req, res) => {
  const cartItem = req.body;
  const userId = req.user._id;

  try {
    const result = await UserService.createUserCart(userId, cartItem);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getUserCart = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await UserService.getUserCart(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

const updateUserCart = async (req, res) => {
  const userId = req.params.id;
  const productId = req.params.idProduct;
  const newAmount = req.body.amount;

  if (!userId) {
    return res.status(400).json({
      status: "ERR",
      message: "The userId is required",
    });
  }
  if (!productId) {
    return res.status(400).json({
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
    const result = await UserService.updateUserCart(
      userId,
      productId,
      newAmount
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

const deleteProductUserCart = async (req, res) => {
  const userId = req.params.id;
  const productId = req.params.idProduct;

  if (!userId) {
    return res.status(400).json({
      status: "ERR",
      message: "The userId is required",
    });
  }
  if (!productId) {
    return res.status(400).json({
      status: "ERR",
      message: "The productId is required",
    });
  }

  try {
    const result = await UserService.deleteProductUserCart(userId, productId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

const deleteAllProductInCart = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({
      status: "ERR",
      message: "The userId is required",
    });
  }

  try {
    const result = await UserService.deleteAllProductInCart(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

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
    let bodyrefreshToken = req.body.refresh_token;
    console.log("bodyrefreshToken", bodyrefreshToken);
    if (!token && !bodyrefreshToken) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    let response;
    if (token) {
      response = await JwtService.refreshTokenJwtService(token);
    } else {
      response = await JwtService.refreshTokenJwtService(bodyrefreshToken);
    }

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
  postCommentAndRating,
};
