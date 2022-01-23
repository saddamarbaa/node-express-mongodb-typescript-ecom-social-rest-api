const mongoose = require('mongoose');

const User = require('../models/users.model');
const sendEmail = require('../lib/sendEmail');

// Handling Post Request to /api/v1/users/signup
exports.user_signup = async (req, res) => {
  const { firstName, lastName, email, password, dateOfBirth, gender, cart, confirmPassword, role } = req.body;

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    cart,
    role,
  });

  try {
    const user = await newUser.save();

    // send back only the user and token (not password been send)
    const token = user.createJWT();

    res.status(201).send({
      message: 'Registered Successfully',
      success: true,
      status: 201,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        cart: user.cart,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        role: user?.role,
      },
      token: token,
    });

    // send mail
    sendEmail(user?.email);
  } catch (error) {
    if (error?.code === 11000) {
      // also we can send  422(422 Unprocessable Entity)
      // 409 Conflict
      return res.status(409).send({
        success: false,
        message: 'Unable to save user to database',
        status: 409,
        error: `Email address ${newUser.email} is already taken`,
      });
    }

    // 500 Internal Server Error
    return res.status(500).send({
      success: false,
      message: 'Unable to save to user to database',
      status: 500,
      error: error,
    });
  }
};

// Handling Post Request to /api/v1/users/login
exports.user_login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: 'Please provide email and password',
      success: false,
      status: 400,
    });
  }

  try {
    const user = await User.findOne({ email: email });

    // 401 Unauthorized
    if (!user) {
      return res.status(401).send({
        Status: 'Auth Failed (Invalid Credentials)',
        success: false,
        status: 401,
      });
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).send({
        Status: 'Auth Failed (Invalid Credentials)',
        success: false,
        status: 401,
      });
    }

    // Send back only the user and token (dont send the password)
    const token = user.createJWT();

    return res.status(200).send({
      message: 'Auth successful',
      success: true,
      status: 200,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
      token: token,
    });
  } catch (error) {
    // 500 Internal Server Error
    return res.status(500).send({
      message: 'Internal Server Error(invalid id)',
      success: false,
      status: 500,
      error: error,
    });
  }
};

// Handling delete Request to /api/v1/users/userId
exports.user_delete = async (req, res, next) => {
  const toBeDeletedUser = await User.findByIdAndRemove({
    _id: req.params.userId,
  });

  if (!toBeDeletedUser) {
    res.status(400).send({
      success: false,
      message: `Failed to delete user by given ID`,
      status: 400,
    });
  }

  res.status(200).send({
    message: 'Successfully deleted user by given id',
    success: true,
    status: 200,
  });
};

// Handling patch Request to /api/v1/users/userId
exports.user_update = async (req, res, next) => {
  const { firstName, lastName, email, password, dateOfBirth, gender, cart, confirmPassword } = req.body;

  const userId = req.params.userId;

  User.findById(userId).then((user) => {
    if (!user) {
      return res.status(400).send({
        success: false,
        message: `Database Update Failure `,
        status: 400,
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;
    user.confirmPassword = confirmPassword || user.confirmPassword;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.cart = cart || user.cart;

    user
      .save()
      .then((updatedUser) => {
        return res.status(200).send({
          message: 'Successfully updated user by given id',
          success: true,
          status: 201,
          user: {
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            dateOfBirth: updatedUser.dateOfBirth,
            gender: updatedUser.gender,
            cart: updatedUser.cart,
            createdAt: updatedUser?.createdAt,
            updatedAt: updatedUser?.updatedAt,
          },
        });
      })
      .catch((error) => {
        if (error?.code === 11000) {
          return res.status(409).send({
            success: false,
            message: 'Unable to update user in database',
            status: 409,
            error: `Email address ${email} is already taken`,
          });
        }

        // 500 Internal Server Error
        return res.status(500).send({
          success: false,
          message: 'Unable to update user in database',
          status: 500,
          error: error,
        });
      });
  });
};
