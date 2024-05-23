const OrderService = require("../services/OrderService");
const UserService = require("../services/UserService");

const dataCreateOrder = {
  address: "Tỉnh Bình Định,Huyện An Lão ân hữu",
  city: "52",
  email: "test@gmail.com",
  fullName: "TQK DEPZAI quaaa",
  itemsPrice: 123000,
  orderItems: [
    {
      amount: 1,
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA",
      name: "Ủa alo",
      price: 123000,
      _id: "66196c4b5ffdc229d25dd7ff", // Ensure _id field is present
    },
  ],
  paymentMethod: "cod",
  phone: "0389346149",
  shippingPrice: 50000,
  totalPrice: 173000,
  user: "664b678e48aa92aa6e00d3d3",
};

// paymentMethod is missing
const wrongDataCreateOrder = {
  address: "Tỉnh Bình Định,Huyện An Lão ân hữu",
  city: "52",
  email: "test@gmail.com",
  fullName: "TQK DEPZAI quaaa",
  itemsPrice: 123000,
  orderItems: [
    {
      amount: 0,
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA",
      name: "Ủa alo",
      price: 123000,
      _id: "66196c4b5ffdc229d25dd7ff", // Ensure _id field is present
    },
  ],
  paymentMethod: "",
  phone: "0389346149",
  shippingPrice: 50000,
  totalPrice: 173000,
  user: "664b678e48aa92aa6e00d3d3",
};

const mongoose = require("mongoose");
jest.setTimeout(20000);
// Kết nối đến MongoDB của bạn
const MONGODB_URI =
  "mongodb+srv://tqk28082k3:TQKhai21522185@cluster0.xfe0b6z.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

describe("fetchAllOrder", () => {
  it("should fetch successfully", async () => {
    const Orders = await OrderService.getAllOrder();
    expect(Orders.status).toEqual("OK");
  });
});

describe("updateStatusOrder", () => {
  it("should fetch data successfully", async () => {
    const orderId = "664ccbbd8a98c0034acbfda3";
    const data = {
      isDelivered: true,
    };
    const result = await OrderService.updateStatusOrder(orderId, data);
    expect(result.status).toEqual("OK");
  });

  it("should fetch data failed in case orderId is blank", async () => {
    const data = {
      isDelivered: true,
    };
    const result = await OrderService.updateStatusOrder("", data);
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The orderId is required");
  });

  it("should fetch data failed in case orderId is wrong", async () => {
    const data = {
      isDelivered: true,
    };
    const result = await OrderService.updateStatusOrder(
      "65798c3854b91034b41cd1e6",
      data
    );
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The order is not defined");
  });
});

describe("createOrder", () => {
  it("should create Order successfully", async () => {
    const result = await OrderService.createOrder(dataCreateOrder);
    expect(result.status).toEqual("OK");
    expect(result.message).toEqual("success");
    expect(typeof result.data).toBe("object");
  });

  it("should create Order failed in case some field is blank", async () => {
    const result = await OrderService.createOrder(wrongDataCreateOrder);
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual(
      "All fields are required, including order items."
    );
  });

  it("should create Order failed in case some thing of products is wrong", async () => {
    const result = await OrderService.createOrder(wrongDataCreateOrder);
    expect(result.status).toEqual("ERR");
  });
});

describe("getDetailsOrder", () => {
  it("should fetch data successfully", async () => {
    const resultCreate = await OrderService.createOrder(dataCreateOrder);
    if (resultCreate.status === "OK") {
      const result = await OrderService.getOrderDetails(resultCreate.data._id);
      expect(result.status).toEqual("OK");
    }
  });

  it("should fetch data failed in case orderId is blank", async () => {
    const result = await OrderService.getOrderDetails("");
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The order id is required");
  });

  it("should fetch data failed in case user have no order", async () => {
    const result = await OrderService.getOrderDetails(
      "664cc598f5d248c5be60dec6" //id không tồn tại
    );
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The order is not defined");
  });
});

describe("getAllOrderByUSERID", () => {
  it("should fetch data successfully", async () => {
    const resultLogin = await UserService.loginUser({
      email: "test@gmail.com",
      password: "123",
    });

    if (resultLogin.status === "OK") {
      const result = await OrderService.getAllOrderDetails(
        resultLogin.data._id
      );
      expect(result.status).toEqual("OK");
      expect(result.message).toEqual("SUCESSS");
    }
  });

  it("should fetch data failed in case userID is blank", async () => {
    const result = await OrderService.getAllOrderDetails("");
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The userId is required");
  });

  it("should fetch data failed in case userID is wrong", async () => {
    const result = await OrderService.getAllOrderDetails(
      "65798c3854b91034b41cd1e3"
    );
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The order is not defined");
  });
});

describe("cancelOrderDetails", () => {
  it("should cancel successfully", async () => {
    const resultCreate = await OrderService.createOrder(dataCreateOrder);
    if (resultCreate.status === "OK") {
      const result = await OrderService.cancelOrderDetails(
        resultCreate.data._id,
        resultCreate.data.orderItems
      );
      expect(result.status).toEqual("OK");
    }
  });

  it("should cancel failed in case orderId is blank", async () => {
    const result = await OrderService.cancelOrderDetails("", []);
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The orderId is required");
  });

  it("should cancel failed in case orderItems is empty", async () => {
    const order = await OrderService.createOrder(dataCreateOrder);
    const result = await OrderService.cancelOrderDetails(order._id, []);
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The orderId is required");
  });

  it("should fail when product is not found", async () => {
    const orderItems = [{ product: "nonExistingProductId", amount: 1 }];
    const order = await OrderService.createOrder(dataCreateOrder);

    const result = await OrderService.cancelOrderDetails(order._id, orderItems);
    expect(result.status).toEqual("ERR");
    expect(result.message).toMatch("The orderId is required");
  });
});
