const cancelOrderDetails = require('./cancelOrderDetails');
const Product = require('./models/Product');
const Order = require('./models/Order');

jest.mock('./models/Product');
jest.mock('./models/Order');

describe('cancelOrderDetails function', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should cancel order details successfully', async () => {
    const id = 'order_id';
    const data = [];
    const order = {};
    Product.findOneAndUpdate.mockResolvedValueOnce({});
    Order.findByIdAndDelete.mockResolvedValueOnce(order);

    await expect(cancelOrderDetails(id, data)).resolves.toEqual({
      status: 'OK',
      message: 'success',
      data: order,
    });

    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(data.length);
    expect(Order.findByIdAndDelete).toHaveBeenCalledWith(id);
  });

  it('should handle when the order is not defined', async () => {
    const id = 'order_id';
    const data = [];
    Product.findOneAndUpdate.mockResolvedValueOnce(null);

    await expect(cancelOrderDetails(id, data)).resolves.toEqual({
      status: 'ERR',
      message: 'The order is not defined',
    });

    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(data.length);
  });

  it('should handle when products do not exist', async () => {
    const id = 'order_id';
    const data = [];
    const errorMessage = 'Some error occurred';
    Product.findOneAndUpdate.mockResolvedValueOnce({});
    Order.findByIdAndDelete.mockRejectedValueOnce(new Error(errorMessage));

    await expect(cancelOrderDetails(id, data)).rejects.toThrow(errorMessage);

    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(data.length);
    expect(Order.findByIdAndDelete).toHaveBeenCalledWith(id);
  });
});
