import { NextFunction, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { resolve } from 'path';

import { AuthenticatedRequestBody, IUser, OrderT, ProcessingOrderT } from '@src/interfaces';
import { customResponse } from '@src/utils';
import Order from '@src/models/Order.model';
import User from '@src/models/User.model';
import Product from '@src/models/Product.model';
import { authorizationRoles } from '@src/constants';

export const getOrdersService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user?._id })
      .populate(
        'user.userId',
        '-password -confirmPassword  -status -cart -role -status -isVerified -isDeleted -acceptTerms'
      )
      .populate('orderItems.product')
      .exec();

    const data = {
      orders,
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
    return next(InternalServerError);
  }
};

export const getOrderService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate(
        'user.userId',
        '-password -confirmPassword  -status -cart -role -status -isVerified -isDeleted -acceptTerms'
      )
      .populate('orderItems.product')
      .exec();

    if (!order) {
      return next(new createHttpError.BadRequest());
    }

    if (order.user.userId._id.toString() !== req?.user?._id.toString()) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    const data = {
      order,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found order by ID ${orderId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const postOrderService = async (
  req: AuthenticatedRequestBody<ProcessingOrderT>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shippingInfo, paymentInfo, textAmount, shippingAmount, totalAmount, orderStatus, orderItems } = req.body;

    const authUser = await User.findById(req.user?._id).select('-password -confirmPassword -cart -status');

    if (!authUser) {
      return next(createHttpError(401, `Auth Failed`));
    }

    // check if ordered product still exists on db
    if (orderItems && orderItems.length > 0) {
      orderItems.forEach(async (item) => {
        const isProductStillExits = await Product.findById(item.product);
        if (!isProductStillExits) return next(new createHttpError.BadRequest());
      });
    }

    // const userCart = await User.findById(req.user?._id).select('cart').populate('cart.items.productId').exec();
    const userCart = await User.findById(req.user?._id);
    if (!userCart && !orderItems) {
      return next(createHttpError(401, `Auth Failed`));
    }

    if (!orderItems && userCart.cart.items.length <= 0) {
      return next(createHttpError(402, `Oder Failed (your cart is empty)`));
    }

    const finalItemsToOrder =
      orderItems && orderItems.length > 0
        ? orderItems
        : userCart.cart.items.map((item: { quantity: number; productId: { _doc: OrderT } }) => {
            return { quantity: item.quantity, product: item.productId };
          });

    const itemTotalAmount = finalItemsToOrder.reduce(
      (accumulator: number, currentValue: { product: string; quantity: number }) => accumulator + currentValue.quantity,
      0
    );

    // Create new order
    // Assuming (name,email,phone,address) will be coming in req.body
    const order = new Order({
      shippingInfo,
      paymentInfo,
      textAmount,
      shippingAmount,
      totalAmount: totalAmount || itemTotalAmount + shippingAmount + textAmount,
      orderStatus,
      user: {
        name: authUser.name,
        surname: authUser.surname,
        email: authUser.email,
        phone: authUser.mobileNumber,
        address: authUser.address,
        userId: userCart._id,
      },
      orderItems: finalItemsToOrder,
    });

    // Save the order
    const orderedItem = await order.save();
    orderedItem.user = authUser;

    // Clear the cart
    if (!orderItems) {
      await authUser.clearCart();
    }

    const data = {
      order: orderedItem,
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
    return next(InternalServerError);
  }
};

export const clearSingleOrderService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new createHttpError.BadRequest());
    }

    if (order.user.userId.toString() !== req?.user?._id.toString()) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    const isRemoved = await Order.findByIdAndRemove({
      _id: orderId,
    });

    if (!isRemoved) {
      return next(createHttpError(400, `Failed to delete order by given ID ${orderId}`));
    }

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted order by ID ${orderId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const clearAllOrdersService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
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

export const getInvoicesService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('user.userId').populate('orderItems.product').exec();

    if (!order) {
      return next(createHttpError(400, `No order found.`));
    }

    if (
      order.user?.userId?._id.toString() !== req?.user?._id.toString() &&
      req?.user?.role !== authorizationRoles?.client
    ) {
      return next(createHttpError(403, `Unauthorized`));
    }

    const invoiceName = `invoice-${orderId}.pdf`;

    const invoicePath = resolve(process.cwd(), `${process.env.PWD}/public/invoices/${invoiceName}`);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
      underline: true,
    });
    pdfDoc.text('-----------------------');
    let totalPrice = 0;
    order.orderItems.forEach((prod: any) => {
      totalPrice += prod.quantity * prod.product.price;
      // eslint-disable-next-line no-useless-concat
      pdfDoc.fontSize(15).text(`${prod.product.name} - ${prod.quantity} x ` + `$${prod.product.price}`);
    });
    pdfDoc.text('----------------------------------');
    pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
    pdfDoc.end();
  } catch (error) {
    return next(InternalServerError);
  }
};
