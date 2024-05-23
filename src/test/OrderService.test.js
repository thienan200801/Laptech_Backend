const OrderService = require("../services/OrderService");

const mongoose = require("mongoose");
jest.setTimeout(20000);
// Kết nối đến MongoDB của bạn
const MONGODB_URI =
  "mongodb+srv://tqk28082k3:TQKhai21522185@cluster0.xfe0b6z.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// describe("fetchAllOrder", () => {
//   it("should fetch successfully", async () => {
//     const Orders = await OrderService.getAllOrder();
//     expect(Orders.status).toEqual("OK");
//   });
// });

describe("updateStatusOrder", () => {
  it("should fetch data successfully", async () => {
    const orderId = "664ccbbd8a98c0034acbfda3";
    const data = {
      isDelivered: true,
    };

    const result = await OrderService.updateStatusOrder(orderId, data);
    expect(result.status).toEqual("OK");
  });
});
