/** @format */

// Import jwt from node_modules (Using jwt)
const jwt = require("jsonwebtoken");

// Access Environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET || "asdl4u47jj4dj";

// Middleware function to authenticate token
// Check to make sure header is not undefined, if so, return Forbidden (403)
const authenticateToken = (req, res, next) => {
	// console.log("req.headers is ", req.headers);

	// get jwt Token from the request header
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	// if there is no token
	// HTTP Status 401 mean Unauthorized
	if (!token) {
		return res.status(401).send({
			status: "Unauthorized",
		});
	}

	// if there is token then verify using the same Secret Key
	jwt.verify(token, TOKEN_SECRET, (err, user) => {
		// HTTP Status 403 mean Forbidden
		if (err) {
			return res.status(403).send({
				status: "Auth Failed",
			});
		}
		console.log("The Authorized User is ", user);
		req.user = user;

		next();
	});
};

module.exports = authenticateToken;
