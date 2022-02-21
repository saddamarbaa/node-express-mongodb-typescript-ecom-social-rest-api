const { check, body, params } = require('express-validator');

const User = require('../../models/users.model');

exports.loginValidation = () => {
  return [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password', 'Please provide password with only numbers and text and must be at least 6 characters.')
      .isLength({ min: 6, max: 40 })
      .isAlphanumeric()
      .trim()
  ];
};

exports.signupValidation = () => {
  return [
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(`E-Mail address ${value} is already exists, please pick a different one.`);
          }
        });
      })
      .normalizeEmail(),
    body('password', 'Please provide password with only numbers and text and must be at least 6 characters.')
      .isLength({ min: 6, max: 40 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
    body('firstName', 'Please provide firstName and must be at least 3 characters and less than 16 characters')
      .isLength({ min: 3, max: 15 })
      .trim(),
    body('lastName', 'Please provide lastName and must be at least 3 characters and less than 16 characters')
      .isLength({ min: 3, max: 15 })
      .trim()
  ];
};

exports.userIdValidation = () => {
  return [
    check('userId', 'Please provide vaild user id')
      .exists()
      .isLength({ min: 3 })
      .trim()
  ];
};

exports.forgetPasswordValidation = () => {
  return [
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email.')
  ];
};

exports.verifyValidation = () => {
  return [
    check('userId', 'Please provide vaild user id')
      .exists()
      .isLength({ min: 3 })
      .trim(),
    check('token', 'Please provide vaild user token')
      .exists()
      .isLength({ min: 5 })
      .trim()
  ];
};
