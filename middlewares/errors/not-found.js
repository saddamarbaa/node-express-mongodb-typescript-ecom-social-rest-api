// Handle error if the routes not found or there's any problem in DB connection
const notFoundHandlerMiddleware = (req, res, next) => {
  // Create an error and pass it to the next function
  const error = new Error('Not found');
  error.status = 404;
  next(error);
};

module.exports = notFoundHandlerMiddleware;
