const OrderService = require("../services/OrderService");
const User = require("../services/UserService");

const createOrder = async (req, res) => {
  try {
    const {
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      user,
      phone,
      orderItems,
    } = req.body;

    // Transform _id to product
    const transformedOrderItems = orderItems.map((item) => {
      return {
        ...item,
        product: item._id,
      };
    });

    // Validate input fields
    if (
      !paymentMethod ||
      !itemsPrice ||
      !shippingPrice ||
      !totalPrice ||
      !fullName ||
      !address ||
      !city ||
      !phone ||
      !orderItems ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        status: "ERR",
        message: "All fields are required, including order items.",
      });
    }

    // Validate order items
    for (const item of transformedOrderItems) {
      if (
        !item.product ||
        !item.amount ||
        !item.price ||
        !item.name ||
        !item.image
      ) {
        return res.status(400).json({
          status: "ERR",
          message:
            "Each order item must contain product, amount, price, name, and image fields.",
        });
      }
    }

    const response = await OrderService.createOrder({
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      phone,
      user,
      orderItems: transformedOrderItems, // Use the transformed orderItems
    });

    return res.status(200).json(response);
  } catch (e) {
    console.log(e, "err");
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const getAllOrderDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await OrderService.getAllOrderDetails(userId);
    return res.status(200).json(response);
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await OrderService.getOrderDetails(orderId);
    return res.status(200).json(response);
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e,
    });
  }
};

const cancelOrderDetails = async (req, res) => {
  try {
    const data = req.body.orderItems;
    const orderId = req.body.orderId;
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    const response = await OrderService.cancelOrderDetails(orderId, data);
    return res.status(200).json(response);
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const data = await OrderService.getAllOrder();
    return res.status(200).json(data);
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e,
    });
  }
};

const updateStatusOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const status = req.body;
    console.log(status, orderId);
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    const response = await OrderService.updateStatusOrder(orderId, status);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrderDetails,
  getDetailsOrder,
  cancelOrderDetails,
  getAllOrder,
  updateStatusOrder,
};
