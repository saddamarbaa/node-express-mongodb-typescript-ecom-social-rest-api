/**
 *
 * Handle server Side Errors
 */

const handleServerSideErrors = (message) => {
  res.status(500).send({
    data: [],
    success: false,
    error: true,
    message: message || 'Internal Server Error',
    status: 500,
  });
};

module.exports = handleServerSideErrors;
