/** @format */

const express = require("express");
const router = express.Router();

const userController = require("../controllers/users.controller");

// Import Middleware function to authenticate token From different file
const authenticateToken = require("../middleware/auth/check-auth");

// API Endpoint for Handling Post Request to /api/v1/users/login
router.post("/login", userController.user_login);

// API Endpoint for Handling Post Request to /api/v1/users/signup
router.post("/signup", userController.user_signup);

// API Endpoint for Handling delete Request to  /api/v1/users/delete
// Call (authenticateToken) Middleware function first
// This is now a protected route
router.delete("/:userId", authenticateToken, userController.user_delete);

module.exports = router;
