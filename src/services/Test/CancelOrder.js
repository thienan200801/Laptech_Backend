const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let order = [];
        const promises = data.map(async (order) => {
          const productData = await Product.findOneAndUpdate(
            {
              _id: order.product,
              selled: { $gte: order.amount },
            },
            {
              $inc: {
                countInStock: +order.amount,
                selled: -order.amount,
              },
            },
            { new: true }
          );
          if (productData) {
            order = await Order.findByIdAndDelete(id);
            if (order === null) {
              resolve({
                status: "ERR",
                message: "The order is not defined",
              });
            }
          } else {
            return {
              status: "OK",
              message: "ERR",
              id: order.product,
            };
          }
        });
        const results = await Promise.all(promises);
        const newData = results && results[0] && results[0].id;
  
        if (newData) {
          resolve({
            status: "ERR",
            message: `San pham voi id: ${newData} khong ton tai`,
          });
        }
        resolve({
          status: "OK",
          message: "success",
          data: order,
        });
      } catch (e) {
        reject(e);
      }
    });
  };