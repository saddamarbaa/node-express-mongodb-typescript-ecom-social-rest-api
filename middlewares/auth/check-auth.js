// Import jwt from node_modules (Using jwt)
const jwt = require('jsonwebtoken');

// Access Environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET;

// Middleware function to authenticate token
// Check to make sure header is not undefined, if so, return Forbidden (403)
const authenticateToken = (req, res, next) => {
  // get jwt Token from the request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // if there is no token
  // HTTP Status 401 mean Unauthorized
  if (!token) {
    return res.status(401).send({
      status: 401,
      success: false,
      message: `Auth Failed (Invalid Credentials)`,
    });
  }

  // if there is token then verify using the same Secret Key
  const decodedToken = jwt.verify(token, TOKEN_SECRET, (err, user) => {
    // HTTP Status 403 mean Forbidden
    if (err) {
      return res.status(403).send({
        status: 403,
        success: false,
        message: `Auth Failed (Unauthorized)`,
      });
    }

    // console.log('The Authorized User is ', user);
    // Add user to the request
    req.user = user;

    // if we did success go to the next middleware
    next();
  });
};

module.exports = authenticateToken;
