import Joi from 'joi';

// @ts-ignore
import JoiObjectId from 'joi-objectid';
import { productCategory } from '@src/constants';

const vaildObjectId = JoiObjectId(Joi);

export const productSchema = {
  addProduct: Joi.object({
    productImages: Joi.array()
      .items(
        Joi.object()
          .keys({
            filename: Joi.string().required().label('Invalid request (Please upload Image)'),
          })
          .required()
          .label('Invalid request (Please upload Image)')
      )
      .required(),
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(15).required(),
    price: Joi.number().required(),
    brand: Joi.string().required(),
    category: Joi.string()
      // .required()
      .valid(
        productCategory.all,
        productCategory.book,
        productCategory.electronic,
        productCategory.football,
        productCategory.jewelery,
        productCategory.menShoe,
        productCategory.menClothe,
        productCategory.sport,
        productCategory.toy,
        productCategory.womenClothe,
        productCategory.womenShoe,
        productCategory.PersonalComputer
      ),
    stock: Joi.string(),
    count: Joi.number(),
  }),
  updateProduct: Joi.object({
    productId: vaildObjectId().required(),
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(15),
    price: Joi.number(),
    brand: Joi.string(),
    category: Joi.string().valid(
      productCategory.all,
      productCategory.book,
      productCategory.electronic,
      productCategory.football,
      productCategory.jewelery,
      productCategory.menShoe,
      productCategory.menClothe,
      productCategory.sport,
      productCategory.toy,
      productCategory.womenClothe,
      productCategory.womenShoe,
      productCategory.PersonalComputer
    ),
    stock: Joi.string(),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    productImages: Joi.array().items(
      Joi.object()
        .keys({
          filename: Joi.string().required().label('Invalid request (Please upload Image)'),
        })
        .required()
        .label('Invalid request (Please upload Image)')
    ),
    count: Joi.number(),
  }),
  reviewProduct: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(3).max(300).required(),
    productId: vaildObjectId().required().label('Invalid request (Please please provide vaild product id)'),
  }),
  validatedProductId: Joi.object({
    productId: vaildObjectId().required(),
  }),
};

export default productSchema;
