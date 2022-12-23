import Joi from 'joi';

export const productSchema = {
  addProduct: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(15).required(),
    price: Joi.number().required(),
    brand: Joi.string().required(),
    category: Joi.string(),
    stock: Joi.string(),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    profileImage: Joi.string(),
    count: Joi.number(),
    // filename: Joi.string().required().label('Invalid request (Please upload Image)'),
  }),
  updateProduct: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(15),
    price: Joi.number(),
    brand: Joi.string(),
    category: Joi.string(),
    stock: Joi.string(),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    profileImage: Joi.string(),
    count: Joi.number(),
  }),
};

export default productSchema;
