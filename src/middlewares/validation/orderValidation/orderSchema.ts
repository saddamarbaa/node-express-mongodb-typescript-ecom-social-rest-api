import Joi from 'joi';

// @ts-ignore
import JoiObjectId from 'joi-objectid';
import { orderStatus } from '@src/constants';

const vaildObjectId = JoiObjectId(Joi);

export const orderSchema = {
  processingOrder: Joi.object({
    paymentInfo: Joi.string().required(),
    orderStatus: Joi.string().required(),
    textAmount: Joi.number().min(1).required(),
    shippingAmount: Joi.number().min(1).required(),
    totalAmount: Joi.number().min(1),
    shippingInfo: Joi.object()
      .keys({
        address: Joi.string().required(),
        phoneNo: Joi.string().required(),
        zipCode: Joi.string().required(),
        status: Joi.string(),
        street: Joi.string(),
        city: Joi.string().required(),
        country: Joi.string().required(),
      })
      .required(),
    orderItems: Joi.array()
      .items(
        Joi.object()
          .keys({
            product: vaildObjectId().required().label('Invalid request (Please please provide vaild product id)'),
            quantity: Joi.number().min(1).required(),
          })
          .required()
      )
      .default([]),
  }),
  updateOrderStatus: Joi.object({
    orderStatus: Joi.string()
      .required()
      .valid(
        orderStatus.cancelled,
        orderStatus.completed,
        orderStatus.delivered,
        orderStatus.pending,
        orderStatus.shipped,
        orderStatus.waitingPayment,
        orderStatus.waitingPickup
      ),
  }),
  createStripeCheckoutSession: Joi.object({
    orderItems: Joi.array()
      .items(
        Joi.object()
          .keys({
            product: Joi.object()
              .keys({
                name: Joi.string().required(),
                price: Joi.number().required(),
                description: Joi.string().required(),
                productImage: Joi.string().required(),
              })
              .required(),
            quantity: Joi.number().min(1).required(),
          })
          .required()
      )
      .required(),
  }),
  validatedOrderId: Joi.object({
    orderId: vaildObjectId().required(),
  }),
};

export default orderSchema;
