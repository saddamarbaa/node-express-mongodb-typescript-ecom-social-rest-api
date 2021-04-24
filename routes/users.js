/** @format */

const express = require("express");
const router = express.Router();

const userController = require("../controllers/users");

// Import Middleware function to authenticate token From different file
const authenticateToken = require("../auths/auth");

// Handling /User(login)
router.post("/login", userController.user_login);

// Handling Post Request to /User
router.post("/signup", userController.user_signup);

// Handling delete Request to delete user
router.delete("/:userId", authenticateToken, userController.user_delete);

module.exports = router;
