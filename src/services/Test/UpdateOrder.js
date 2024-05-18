const updateStatusOrder = (id, status) => {
    return new Promise(async (resolve, reject) => {
      try {
        const checkOrder = await Order.findOne({
          _id: id,
        });
        if (checkOrder === null) {
          resolve({
            status: "ERR",
            message: "The order is not defined",
          });
        }
  
        const updatedOrder = await Order.findByIdAndUpdate(id, status, {
          new: true,
        });
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: updatedOrder,
        });
      } catch (e) {
        reject(e);
      }
    });
  };