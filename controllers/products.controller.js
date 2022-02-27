const productServices = require('../services/product.service');

exports.getProductsController = async (req, res, next) => {
  try {
    const getProductsService = await productServices.getProducts(req, res, next);
    return res.status(getProductsService.status).send(getProductsService);
  } catch (error) {
    return next(error);
  }
};
