import createHttpError from 'http-errors';
import { NextFunction } from 'express';
import Joi from 'joi';

const validator = async (schemaName: Joi.ObjectSchema, body: object, next: NextFunction) => {
  const value = await schemaName.validate(body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  });

  try {
    // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
    value.error ? next(createHttpError(422, value.error.details[0].message)) : next();
  } catch (error) {
    console.log(error);
  }
};

export default validator;
