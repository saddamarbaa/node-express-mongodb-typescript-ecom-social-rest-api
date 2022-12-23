import dotenv from 'dotenv-safe';

dotenv.config();

export const environmentConfig = {
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  WEBSITE_URL: process.env.WEBSITE_URL,
  API_URL: process.env.API_URL,
  API_VERSION: process.env.API_VERSION,
  JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME,
  PORT: process.env.PORT || 8000,
  SEND_GRID_API_KEY: process.env.SEND_GRID_API_KEY,
  ADMIN_SEND_GRID_EMAIL: process.env.ADMIN_SEND_GRID_EMAIL,
  ADMIN_ROLE: process.env.ADMIN_ROLE,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL,
  ACCESS_TOKEN_SECRET_KEY: process.env.ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_KEY_EXPIRE_TIME: process.env.ACCESS_TOKEN_KEY_EXPIRE_TIME,
  REFRESH_TOKEN_KEY_EXPIRE_TIME: process.env.REFRESH_TOKEN_KEY_EXPIRE_TIME,
  JWT_ISSUER: process.env.JWT_ISSUER,
  REST_PASSWORD_LINK_EXPIRE_TIME: process.env.REST_PASSWORD_LINK_EXPIRE_TIME,
};

export default environmentConfig;
