const { ADMIN_ROLE, ADMIN_EMAIL } = require('../../configs/environment.config');
const User = require('../../models/users.model');
const Response = require('../../utils/response');

// Middleware function to check admin role
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req?.user.email });
    const adminUser = user && user.role === ADMIN_ROLE && ADMIN_EMAIL.includes(`${req?.user.email}`);
    if (!adminUser) {
      return res.status(403).send(Response({}, false, true, 'Auth Failed (Unauthorized)!!', 403));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = isAdmin;
