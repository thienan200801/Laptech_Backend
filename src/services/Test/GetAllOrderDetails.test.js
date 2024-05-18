const getAllOrderDetails = require('./GetAllOrderDetails.js');
const Order = require('./models/Order');

jest.mock('./models/Order');

describe('getAllOrderDetails function', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should return order details successfully', async () => {
    const id = 'user_id';
    const orderData = [
      // Mock order data
    ];
    Order.find.mockResolvedValueOnce(orderData);

    await expect(getAllOrderDetails(id)).resolves.toEqual({
      status: 'OK',
      message: 'SUCCESS',
      data: orderData,
    });

    expect(Order.find).toHaveBeenCalledWith({ user: id });
  });

  it('should handle when no order is found', async () => {
    const id = 'user_id';
    Order.find.mockResolvedValueOnce(null);

    await expect(getAllOrderDetails(id)).resolves.toEqual({
      status: 'ERR',
      message: 'The order is not defined',
    });

    expect(Order.find).toHaveBeenCalledWith({ user: id });
  });

  it('should handle errors', async () => {
    const id = 'user_id';
    const errorMessage = 'Some error occurred';
    Order.find.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getAllOrderDetails(id)).rejects.toThrow(errorMessage);

    expect(Order.find).toHaveBeenCalledWith({ user: id });
  });
});
