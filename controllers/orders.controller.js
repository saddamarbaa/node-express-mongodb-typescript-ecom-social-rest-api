const orderServices = require('../services/order.service');

exports.getOrdersController = async (req, res, next) => {
  try {
    const getOrdersService = await orderServices.getOrders(req, res, next);
    return res.status(getOrdersService.status).send(getOrdersService);
  } catch (error) {
    return next(error);
  }
};

exports.postOrderController = async (req, res, next) => {
  try {
    const postOrderService = await orderServices.postOrder(req, res, next);
    return res.status(postOrderService.status).send(postOrderService);
  } catch (error) {
    return next(error);
  }
};

exports.clearOrdersController = async (req, res, next) => {
  try {
    const clearOrdersService = await orderServices.clearOrders(req, res, next);
    return res.status(clearOrdersService.status).send(clearOrdersService);
  } catch (error) {
    return next(error);
  }
};
