const express = require('express');
const { check, body } = require('express-validator');

const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/users.controller');
const isAuth = require('../middlewares/auth/check-auth');
const User = require('../models/users.model');
const isAdmin = require('../middlewares/auth/check-admin');
const paginationMiddleware = require('../middlewares/pagination/pagination.middleware');

const router = express.Router();

// API Endpoint for Handling Get Request to /api/admin/users
router.get('/users', isAuth, isAdmin, paginationMiddleware(User), adminController.admin_get_all_user);

// API Endpoint for Handling Post Request to /api/admin/users
router.post(
  '/users',
  isAuth,
  isAdmin,
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

module.exports = router;
