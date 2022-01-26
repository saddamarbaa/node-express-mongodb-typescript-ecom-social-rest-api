const { ADMIN_ROLE, ADMIN_EMAIL } = require('../../configs/environment.config');
const User = require('../../models/users.model');

// Middleware function to check admin role
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req?.user.email });

    const adminUser = user && user.role === ADMIN_ROLE && user.email === ADMIN_EMAIL;
    if (!adminUser) {
      return res.status(403).send({
        status: 403,
        success: false,
        message: `Auth Failed (Unauthorized)`,
      });
    }
    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `DB Error`,
      status: 500,
      error: error,
    });
  }
};

module.exports = isAdmin;
