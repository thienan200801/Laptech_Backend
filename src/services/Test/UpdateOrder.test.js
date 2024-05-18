const updateStatusOrder = require('./updateStatusOrder');
const Order = require('./models/Order');

jest.mock('./models/Order');

describe('updateStatusOrder function', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should update order status successfully', async () => {
    const id = 'order_id';
    const status = { status: 'Shipped' };
    const updatedOrder = { _id: id, ...status };
    Order.findOne.mockResolvedValueOnce({});
    Order.findByIdAndUpdate.mockResolvedValueOnce(updatedOrder);

    await expect(updateStatusOrder(id, status)).resolves.toEqual({
      status: 'OK',
      message: 'SUCCESS',
      data: updatedOrder,
    });

    expect(Order.findOne).toHaveBeenCalledWith({ _id: id });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(id, status, { new: true });
  });

  it('should handle when no order is found', async () => {
    const id = 'order_id';
    const status = { status: 'Shipped' };
    Order.findOne.mockResolvedValueOnce(null);

    await expect(updateStatusOrder(id, status)).resolves.toEqual({
      status: 'ERR',
      message: 'The order is not defined',
    });

    expect(Order.findOne).toHaveBeenCalledWith({ _id: id });
  });

  it('should handle errors', async () => {
    const id = 'order_id';
    const status = { status: 'Shipped' };
    const errorMessage = 'Some error occurred';
    Order.findOne.mockRejectedValueOnce(new Error(errorMessage));

    await expect(updateStatusOrder(id, status)).rejects.toThrow(errorMessage);

    expect(Order.findOne).toHaveBeenCalledWith({ _id: id });
  });
});
