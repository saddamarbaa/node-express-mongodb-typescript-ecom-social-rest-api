import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';

import { AuthenticatedRequestBody, IUser, OrderT } from '@src/interfaces';
import { customResponse } from '@src/utils';

import Order from '@src/models/Order.model';
import User from '@src/models/User.model';

export const getOrdersService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user?._id });

    const transformedProducts = orders.map((item) => {
      return {
        quantity: item.products[0].quantity,
        product: item.products[0].product,
      };
    });
    const data = {
      products: transformedProducts,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successful Found all your orders`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const postOrderService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const authUser = await User.findById(req.user?._id);

    if (!authUser) {
      return next(createHttpError(401, `Auth Failed`));
    }

    const userCart = await User.findById(req.user?._id).select('cart').populate('cart.items.productId').exec();

    if (!userCart) {
      return next(createHttpError(401, `Auth Failed`));
    }

    if (userCart.cart.items.length <= 0) {
      return next(createHttpError(402, `Oder Failed (your cart is empty)`));
    }

    const orderItems = userCart.cart.items.map((item: { quantity: number; productId: { _doc: OrderT } }) => {
      return { quantity: item.quantity, product: { ...item.productId._doc } };
    });

    // Create new order
    // Assuming (name,email,phone,address) will be coming in req.body
    const order = new Order({
      user: {
        name: authUser.name,
        surname: authUser.surname,
        email: authUser.email,
        phone: authUser.mobileNumber,
        address: authUser.address,
        userId: userCart._id,
      },
      products: orderItems,
    });

    // Save the order
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const beenOrderItem = await order.save();

    // Clear the cart
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedCart = await authUser.clearCart();

    const data = {
      orderItems,
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Thank you, your orders will be shipped in 2-3 business days`,
        status: 201,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const clearOrdersService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    // Delete complete Order collection
    const dropCompleteCollection = await Order.deleteMany({ 'user.email': req.user?.email });

    if (dropCompleteCollection.deletedCount === 0) {
      return next(createHttpError(400, `Failed to Cleared orders`));
    }

    return res.status(200).send(
      customResponse({
        success: true,
        error: false,
        message: `Successful Cleared all orders`,
        status: 200,
        data: { products: [] },
      })
    );
  } catch (error) {
    return next(error);
  }
};
