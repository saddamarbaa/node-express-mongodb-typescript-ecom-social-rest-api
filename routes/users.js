const express = require('express');
const { check, body } = require('express-validator');

const userController = require('../controllers/users.controller');
const authenticateToken = require('../middlewares/auth/check-auth');
const User = require('../models/users.model');

const router = express.Router();

// API Endpoint for Handling Post Request to /api/v1/users/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
    body('password', 'Please provide password with only numbers and text and must be at least 6 characters.')
      .isLength({ min: 6, max: 40 })
      .trim(),
  ],
  userController.user_login
);

// API Endpoint for Handling Post Request to /api/v1/users/signup
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
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
  ],
  userController.user_signup
);

// API Endpoint for Handling patch Request to /api/v1/users/userId
// Call (authenticateToken) Middleware function first (Protected route)
router.patch('/:userId', authenticateToken, userController.user_update);

// API Endpoint for Handling delete Request to /api/v1/users/userId (Protected route)
router.delete('/:userId', authenticateToken, userController.user_delete);

module.exports = router;
