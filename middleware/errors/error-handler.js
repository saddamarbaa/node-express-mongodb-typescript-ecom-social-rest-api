// An error handling middleware
const errorHandlerMiddleware = (error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      success: false,
      message: error.message,
      status: error.status || 500,
    },
  });
};

module.exports = errorHandlerMiddleware;
