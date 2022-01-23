/** @format */

// Access Environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET;

const isAdmin = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const isAdmin = authHeader && authHeader.split(" ")[1];

	// HTTP Status 401 mean Unauthorized
	if (!isAdmin) {
		return res.status(401).send({
			status: 401,
			success: false,
			message: `Unauthorized `,
		});
	}

	// if we did success go to the next middleware
	next();
};

module.exports = isAdmin;
