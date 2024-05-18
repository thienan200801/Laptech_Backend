const { getAllOrder } = require('./GetAllOrder.js');
const Order = require('./models/OrderProduct.js');

jest.mock('./models/OrderProduct.js');

describe('getAllOrder function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all orders successfully', async () => {
    const orderData = [
      // Mock order data
    ];
    Order.find.mockResolvedValueOnce(orderData);

    await expect(getAllOrder()).resolves.toEqual({
      status: 'OK',
      message: 'Success',
      data: orderData,
    });

    expect(Order.find).toHaveBeenCalledWith();
  });

  it('should handle errors', async () => {
    const errorMessage = 'Some error occurred';
    Order.find.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getAllOrder()).rejects.toThrow(errorMessage);

    expect(Order.find).toHaveBeenCalledWith();
  });
});
