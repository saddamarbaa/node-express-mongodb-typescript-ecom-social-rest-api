const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/users.controller');
const authenticateToken = require('../middleware/auth/check-auth');
const isAdmin = require('../middleware/auth/check-admin');

// API Endpoint for Handling Get Request to /api/admin/users
router.get('/users', authenticateToken, isAdmin, adminController.admin_get_all_user);

// API Endpoint for Handling Post Request to /api/admin/users
router.post('/users', authenticateToken, isAdmin, userController.user_signup);

module.exports = router;
