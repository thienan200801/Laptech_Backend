const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");
const bcrypt = require("bcrypt");
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService");

//createUser tested
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, confirmPassword, phone, address } = newUser;
    if (!name || !email || !password || !confirmPassword || !phone) {
      resolve({
        status: "ERR",
        message: "The input is required",
      });
    }
    if (password !== confirmPassword) {
      resolve({
        status: "ERR",
        message: "The password and confirmPassword is not the same",
      });
    }
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser) {
        resolve({
          status: "ERR",
          message: "The email is already",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        name,
        email,
        password: hash,
        phone,
        address,
      });
      if (createdUser) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
      resolve({
        status: "ERR",
      });
    }
  });
};

//loginUser tested
const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    console.log("userLogin", userLogin);
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "User is not exist",
        });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      console.log("comparePassword", comparePassword);
      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "The password or user is incorrect",
        });
      }

      const access_token = await genneralAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      resolve({
        status: "OK",
        message: "LOGIN SUCCESS",
        data: checkUser,
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//updateUser tested
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });

      if (!data || Object.keys(data).length === 0) {
        resolve({
          status: "ERR",
          message: "The data is required",
        });
      }
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      //reject(e);
    }
  });
};

//createUserCart tested
const createUserCart = async (userId, cartItem) => {
  try {
    const user = await User.findById(userId);

    // Check if the product exists
    const checkProduct = await Product.findById(cartItem._id);
    if (!checkProduct) {
      return { status: "ERR", message: "Product not found" };
    }

    // Check if the user already has a cart
    let existingCart = await Cart.findOne({ orderby: user._id });
    const product = {
      _id: checkProduct._id,
      name: checkProduct.name,
      image: checkProduct.image,
      amount: cartItem.amount,
      price: checkProduct.price,
    };

    if (existingCart) {
      // If the user has an existing cart, update it
      const productIndex = existingCart.products.findIndex(
        (p) => p._id.toString() === checkProduct._id.toString()
      );

      if (productIndex !== -1) {
        existingCart.products[productIndex].amount += cartItem.amount;
      } else {
        existingCart.products.push(product);
      }

      existingCart.cartTotal = existingCart.products.reduce(
        (total, p) => total + p.price * p.amount,
        0
      );

      await existingCart.save();
      return { status: "OK", message: "SUCCESS", data: existingCart };
    } else {
      // If the user doesn't have an existing cart, create a new one
      const newCart = new Cart({
        products: [product],
        cartTotal: product.price * product.amount,
        orderby: user._id,
      });

      await newCart.save();
      user.cart = newCart._id;
      await user.save();

      return { status: "OK", message: "SUCCESS", data: newCart };
    }
  } catch (error) {
    //throw new Error(error);
  }
};

//updateUserCart tested
const updateUserCart = async (userId, productId, newAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERR", message: "User not found" };
    }

    const existingCart = await Cart.findOne({ orderby: user._id });
    if (!existingCart) {
      return { status: "ERR", message: "Cart not found" };
    }

    const productIndex = existingCart.products.findIndex(
      (product) => product._id.toString() === productId
    );
    if (productIndex === -1) {
      return { status: "ERR", message: "Product not found in the cart" };
    }

    existingCart.products[productIndex].amount = newAmount;
    existingCart.cartTotal = existingCart.products.reduce((total, product) => {
      const productTotal = product.price * product.amount;
      return isNaN(productTotal) ? total : total + productTotal;
    }, 0);

    await existingCart.save();
    return {
      status: "OK",
      message: "Updated amount of product in cart successfully",
      data: existingCart,
    };
  } catch (error) {
    //throw new Error(error);
  }
};

//getUserCart tested
const getUserCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ orderby: userId })
      .populate("products")
      .exec();

    if (!cart) {
      return { status: "ERR", message: "Cart not found" };
    }

    return { status: "OK", message: "SUCCESS", data: cart };
  } catch (error) {
    //throw new Error(error);
  }
};

//deleteProductUserCart tested
const deleteProductUserCart = async (userId, productId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERR", message: "User not found" };
    }

    const existingCart = await Cart.findOne({ orderby: user._id });
    if (!existingCart) {
      return { status: "ERR", message: "Cart not found" };
    }

    const productIndex = existingCart.products.findIndex(
      (product) => product._id.toString() === productId
    );
    if (productIndex === -1) {
      return { status: "ERR", message: "Product not found in the cart" };
    }

    existingCart.products.splice(productIndex, 1);
    existingCart.cartTotal = existingCart.products.reduce(
      (total, product) => total + product.price * product.amount,
      0
    );

    await existingCart.save();
    return { status: "OK", message: "Deleted product from cart successfully" };
  } catch (error) {
    //throw new Error(error.message);
  }
};

//deleteAllProductInCart tested
const deleteAllProductInCart = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERR", message: "User not found" };
    }

    const existingCart = await Cart.findOne({ orderby: user._id });
    if (!existingCart) {
      return { status: "ERR", message: "Cart not found" };
    }

    existingCart.products = [];
    existingCart.cartTotal = 0;
    await existingCart.save();

    return {
      status: "OK",
      message: "Deleted all products in cart successfully",
    };
  } catch (error) {
    //throw new Error(error.message);
  }
};

//deleteUser tested
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }

      await User.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete user success",
      });
    } catch (e) {
      //reject(e);
    }
  });
};

//getAllUser tested
const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find().sort({ createdAt: -1, updatedAt: -1 });
      resolve({
        status: "OK",
        message: "Success",
        data: allUser,
      });
    } catch (e) {
      //reject(e);
    }
  });
};

//getDetailsUser tested
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (user === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }
      resolve({
        status: "OK",
        message: "SUCESS",
        data: user,
      });
    } catch (e) {
      //reject(e);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  createUserCart,
  updateUserCart,
  getUserCart,
  deleteProductUserCart,
  deleteAllProductInCart,
  deleteUser,
  getAllUser,
  getDetailsUser,
};
