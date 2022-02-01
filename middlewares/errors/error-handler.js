// An error handling middleware
const errorHandlerMiddleware = (error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
    data: [],
    success: false,
    error: true,
    message: error.message || 'Internal Server Error',
    status:  error.status || 500
    },
  });
};

module.exports = errorHandlerMiddleware;
