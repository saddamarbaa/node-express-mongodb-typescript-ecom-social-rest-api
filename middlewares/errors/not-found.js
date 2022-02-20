const createError = require('http-errors');

// Handle error if the routes not found or there's any problem in DB connection
const notFoundHandlerMiddleware = (req, res, next) => {
  // Create an error and pass it to the next function
  // const error = new Error('Not found');
  // error.status = 404;
  // next(error);
  next(createError(404, 'Not found'));
};

module.exports = notFoundHandlerMiddleware;
