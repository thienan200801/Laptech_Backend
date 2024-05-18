const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const order = await Order.find({
          user: id,
        }).sort({ createdAt: -1, updatedAt: -1 });
        if (order === null) {
          resolve({
            status: "ERR",
            message: "The order is not defined",
          });
        }
  
        resolve({
          status: "OK",
          message: "SUCESSS",
          data: order,
        });
      } catch (e) {
        // console.log('e', e)
        reject(e);
      }
    });
  };