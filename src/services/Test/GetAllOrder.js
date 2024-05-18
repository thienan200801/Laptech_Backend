export const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const allOrder = await Order.find().sort({
          createdAt: -1,
          updatedAt: -1,
        });
        resolve({
          status: "OK",
          message: "Success",
          data: allOrder,
        });
      } catch (e) {
        reject(e);
      }
    });
  };