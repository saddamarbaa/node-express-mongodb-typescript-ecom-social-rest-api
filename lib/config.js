const dotenv = require('dotenv').config();

module.exports = {
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  WEBSITE_URL: process.env.WEBSITE_URL,
  API_VERSION: process.env.API_VERSION,
  JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME,
  PORT: process.env.PORT || 5000,
  SEND_GRID_API_KEY: process.env.SEND_GRID_API_KEY,
  ADMIN_SEND_GRID_EMAIL: process.env.ADMIN_SEND_GRID_EMAIL,
};
