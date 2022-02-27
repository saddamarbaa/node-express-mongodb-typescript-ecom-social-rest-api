const joi = require('joi');

const Response = require('../../utils/response');
const getImageExtension = require('../../utils/getImageExtension');
const isValidObjectId = require('../../utils/isValidMongooseObjectId');

const validation = joi.object({
  name: joi
    .string()
    .alphanum()
    .min(3)
    .max(50)
    .trim(true)
    .required(),
  price: joi
    .string()
    .pattern(/^[0-9]+$/)
    .required(),
  description: joi
    .string()
    .min(15)
    .max(500)
    .trim(true)
    .required()
});

const productValidation = async (req, res, next) => {
  const productImage = req?.file;
  const isValidImage = getImageExtension(req?.file?.mimetype);
  const userId = req?.user?.userId;

  if (!isValidObjectId(userId)) {
    return res.status(403).send(Response({}, false, true, 'Auth Failed (Unauthorized)', 403));
  } else if (!productImage || !isValidImage) {
    return res
      .status(422)
      .send(
        Response(
          {},
          false,
          true,
          'Invalid request in product data please upload image and must be vaild Image type (png / jpg /jpeg / webp)',
          422
        )
      );
  }

  const payload = {
    name: req.body?.name,
    price: req.body?.price,
    description: req.body?.description
  };

  const { error } = validation.validate(payload);
  if (error) {
    const message = `Invalid request in product data : ${error.message}`;
    return res.status(422).send(Response({}, false, true, message, 422));
  } else {
    next();
  }
};

module.exports = productValidation;
