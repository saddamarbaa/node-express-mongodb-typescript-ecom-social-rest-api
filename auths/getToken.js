/** @format */

// Import jwt from node_modules (Using jwt)
const jwt = require("jsonwebtoken");

// Access Environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET || "asdl4u47jj4dj";

// function for Generating Token
const generateAccessToken = (user) => {
	console.log(user);
	const payload = {
		id: user.password,
		email: user.email,
	};

	// expires 1 hours
	return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1hr" });
};

module.exports = generateAccessToken;
