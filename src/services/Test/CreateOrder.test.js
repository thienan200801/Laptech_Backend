import createOrder from './CreateOrder.js';
import { findOneAndUpdate } from './models/Product';
import { create } from './models/Order';

jest.mock('./models/Product');
jest.mock('./models/Order');

describe('createOrder function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order successfully', async () => {
    const newOrder = {};
    findOneAndUpdate.mockResolvedValueOnce({});
    create.mockResolvedValueOnce({});

    await expect(createOrder(newOrder)).resolves.toEqual({
      status: 'OK',
      message: 'success',
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith();
    expect(create).toHaveBeenCalledWith();
  });

  it('should handle insufficient stock', async () => {
    const newOrder = {};
    findOneAndUpdate.mockResolvedValueOnce(null);

    await expect(createOrder(newOrder)).resolves.toEqual({
      status: 'ERR',
      message: 'San pham voi id: <some_id> khong du hang',
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith();
  });

  it('should handle errors', async () => {
    const newOrder = {};
    const errorMessage = 'Some error occurred';
    findOneAndUpdate.mockRejectedValueOnce(new Error(errorMessage));

    await expect(createOrder(newOrder)).rejects.toThrow(errorMessage);

    expect(findOneAndUpdate).toHaveBeenCalledWith();
  });
});
