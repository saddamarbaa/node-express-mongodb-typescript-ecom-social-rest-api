// Import jwt from node_modules (Using jwt)
const jwt = require('jsonwebtoken');

// Access Environment variables
const { TOKEN_SECRET, ACCESS_TOKEN_SECRET_KEY } = require('../../configs/environment.config');
const Response = require('../../utils/response');

module.exports = {
  // Middleware function to authenticate token
  // Check to make sure header is not undefined, if so, return Forbidden (403)
  isAuth: (req, res, next) => {
    // get jwt Token from the request header or cookie
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.authToken || '';

    // if there is no token
    // HTTP Status 401 mean Unauthorized
    if (!token) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    // if there is token then verify using the same Secret Key
    const decodedToken = jwt.verify(token, TOKEN_SECRET, (err, user) => {
      // HTTP Status 403 mean Forbidden
      if (err) {
        return res.status(403).send(Response({}, false, true, 'Auth Failed (Unauthorized)', 403));
      }

      // console.log('The Authorized User is ', user);
      // Add user to the request
      req.user = user;

      // if we did success go to the next middleware
      next();
    });
  },
  isAuthWithAccessToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];

    if (!refreshToken) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY, (err, user) => {
      if (err) {
        // JsonWebTokenError or token has expired
        const message = err.name === 'JsonWebTokenError' ? 'Auth Failed (Unauthorized)' : err.message;
        return res.status(403).send(Response({}, false, true, message, 403));
      }

      req.user = user;
      next();
    });
  }
};
