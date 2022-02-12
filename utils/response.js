/**
 * Function to return similar response for all the endpoints
 * @param {*} [Response data]
 * @param {boolean} success [true or false]
 * @param {boolean} error   [true or false]
 * @param {string} message  [Response message]
 * @param {number} status  [http status code]
 * @return {object}    [Return the final response]
 */
const response = (data, success, error, message, status) => {
  return {
    data: data,
    success: success,
    error: error,
    message: message,
    status: status
  };
};

module.exports = response;
