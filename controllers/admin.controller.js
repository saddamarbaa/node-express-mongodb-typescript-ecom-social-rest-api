const User = require('../models/users.model');

// Handling Get Request to /api/v1/admin/users
exports.admin_get_all_user = (req, res, next) => {
  User.find()
    .select(' firstName lastName email dateOfBirth gender cart createdAt updatedAt 	role')
    .sort({ role: 'asc', createdAt: -1 })
    .exec()
    .then((users) => {
      const responseObject = {
        count: users.length,
        users: users.map((user) => {
          return {
            _id: user._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            dateOfBirth: user?.dateOfBirth,
            gender: user?.gender,
            cart: user?.cart,
            createdAt: user?.createdAt,
            updatedAt: user?.updatedAt,
            role: user?.role,
          };
        }),
      };
      res.status(200).send({
        success: true,
        message: 'Successful Found all users',
        status: 200,
        result: responseObject,
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Internal Server Error',
        error: error,
        success: false,
        status: 500,
      });
    });
};
