const Product = require("../models/ProductModel");
const CommentAndRating = require("../models/CommentAndRating");

//createProduct tested
const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const { name, image, type, company, countInStock, price, description } =
      newProduct;
    if (
      !name ||
      !image ||
      !type ||
      !company ||
      !countInStock ||
      !price ||
      !description
    ) {
      resolve({
        status: "ERR",
        message: "The input is required",
      });
    }
    try {
      const checkProduct = await Product.findOne({
        name: name,
      });
      if (checkProduct !== null) {
        resolve({
          status: "ERR",
          message: "The name of product is already",
        });
      }
      const newProduct = await Product.create({
        name,
        image,
        type,
        company,
        countInStock: Number(countInStock),
        price,
        description,
      });
      if (newProduct) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: newProduct,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//updateProduct tested
const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      const { name, image, type, company, countInStock, price, description } =
        data;
      if (
        !name ||
        !image ||
        !type ||
        !company ||
        !countInStock ||
        !price ||
        !description
      ) {
        resolve({
          status: "ERR",
          message: "The input is required",
        });
      }
      if (checkProduct === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedProduct,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//deleteProduct tested
const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          status: "ERR",
          message: "The id is required",
        });
      }
      const checkProduct = await Product.findOne({
        _id: id,
      });

      if (checkProduct === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      await Product.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete product success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

//getDetailsProduct tested
const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({
        _id: id,
      });
      if (product === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCESS",
        data: product,
      });
    } catch (e) {
      //reject(e);
    }
  });
};

//getAllProduct tested
const getAllProduct = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalProduct = await Product.count();
      let allProduct = [];
      // if (filter) {
      //   const label = filter[0];
      //   const allObjectFilter = await Product.find({
      //     [label]: { $regex: filter[1] },
      //   })
      //     .limit(limit)
      //     .skip(page * limit)
      //     .sort({ createdAt: -1, updatedAt: -1 });
      //   resolve({
      //     status: "OK",
      //     message: "Success",
      //     data: allObjectFilter,
      //     total: totalProduct,
      //     pageCurrent: Number(page + 1),
      //     totalPage: Math.ceil(totalProduct / limit),
      //   });
      // }
      // if (sort) {
      //   const objectSort = {};
      //   objectSort[sort[1]] = sort[0];
      //   const allProductSort = await Product.find()
      //     .limit(limit)
      //     .skip(page * limit)
      //     .sort(objectSort)
      //     .sort({ createdAt: -1, updatedAt: -1 });
      //   resolve({
      //     status: "OK",
      //     message: "Success",
      //     data: allProductSort,
      //     total: totalProduct,
      //     pageCurrent: Number(page + 1),
      //     totalPage: Math.ceil(totalProduct / limit),
      //   });
      // }
      if (!limit) {
        allProduct = await Product.find().sort({
          createdAt: -1,
          updatedAt: -1,
        });
      } else {
        allProduct = await Product.find()
          .limit(limit)
          .skip(page * limit)
          .sort({ createdAt: -1, updatedAt: -1 });
      }
      resolve({
        status: "OK",
        message: "Success",
        data: allProduct,
        total: totalProduct,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalProduct / limit),
      });
    } catch (e) {
      //reject(e);
    }
  });
};

//getAllType tested
const getAllType = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allType = await Product.distinct("type");
      resolve({
        status: "OK",
        message: "Success",
        data: allType,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//getCommentAndRating tested
const getCommentAndRating = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allCommentAndRating = await CommentAndRating.find({
        productId: id,
      })
        .populate("userId", "name avatar")
        .sort({ createdAt: -1, updatedAt: -1 });
      resolve({
        status: "OK",
        message: "Success",
        data: allCommentAndRating,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  getAllType,
  getCommentAndRating,
};
