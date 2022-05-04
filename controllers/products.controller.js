const productServices = require('../services/product.service');

exports.getProductsController = async (req, res, next) => {
  try {
    const getProductsService = await productServices.getProducts(req, res, next);
    return res.status(getProductsService.status).send(getProductsService);
  } catch (error) {
    return next(error);
  }
};

exports.getProductController = async (req, res, next) => {
  try {
    const getProductService = await productServices.getProduct(req, res, next);
    return res.status(getProductService.status).send(getProductService);
  } catch (error) {
    return next(error);
  }
};
