import Joi from 'joi';

// @ts-ignore
import JoiObjectId from 'joi-objectid';

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
        status: Joi.string().required(),
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
};

export default orderSchema;
