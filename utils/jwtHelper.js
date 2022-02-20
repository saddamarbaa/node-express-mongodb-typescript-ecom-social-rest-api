const JWT = require('jsonwebtoken');
const createError = require('http-errors');

// Access Environment variables
const {
  ACCESS_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_KEY_EXPIRE_TIME,
  REFRESH_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_KEY_EXPIRE_TIME
} = require('../configs/environment.config');

module.exports = {
  signAccessToken: userId => {
    // JWT use call back not support Promise so we need to create our own promise
    return new Promise((resolve, reject) => {
      const payload = {
        _id: userId
      };
      const secret = ACCESS_TOKEN_SECRET_KEY;
      const options = {
        expiresIn: ACCESS_TOKEN_KEY_EXPIRE_TIME,
        issuer: 'saddamarbaa.com',
        audience: String(userId)
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          // this is just error may contain sensitive information, so let rejected and don't send to the client
          console.log('jwt error', err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },

  signRefreshToken: userId => {
    return new Promise((resolve, reject) => {
      const payload = {
        _id: userId
      };
      const secret = REFRESH_TOKEN_SECRET_KEY;
      const options = {
        expiresIn: REFRESH_TOKEN_KEY_EXPIRE_TIME,
        issuer: 'saddamarbaa.com',
        audience: String(userId)
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log('jwt error', err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },
  verifyRefreshToken: refreshToken => {
    return new Promise((resolve, reject) => {
      JWT.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, payload) => {
        if (err) {
          console.log('jwt error', err.message);
          return reject(createError.Unauthorized());
        }
        const userId = payload.aud;
        resolve(userId);
      });
    });
  }
};
