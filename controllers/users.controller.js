/** @format */

const mongoose = require("mongoose");

const User = require("../models/users.model");

// API Endpoint for Handling Post Request to / Users/signup
exports.user_signup = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password,
		dateOfBirth,
		gender,
		cart,
		confirmPassword,
	} = req.body;

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
		joinedDate: Date.now(),
	});

	try {
		const user = await newUser.save();

		// send back only the user and token (not password been send)
		const token = user.createJWT();

		return res.status(201).send({
			message: "Registered Successfully",
			success: true,
			status: 201,
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				dateOfBirth: user.dateOfBirth,
				gender: user.gender,
				joinedDate: user.joinedDate,
				cart: user.cart,
			},
			token: token,
		});
	} catch (error) {
		if (error?.code === 11000) {
			// also we can send  422(422 Unprocessable Entity)
			// 409 Conflict
			return res.status(409).send({
				success: false,
				message: "Unable to save user to database",
				status: 409,
				error: `Email address ${newUser.email} is already taken`,
			});
		}

		// 500 Internal Server Error
		return res.status(500).send({
			success: false,
			message: "Unable to save to user to database",
			status: 500,
			error: error,
		});
	}
};

// API Endpoint for Handling Post Request to /User/login
exports.user_login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).send({
			message: "Please provide email and password",
			success: false,
			status: 400,
		});
	}

	// Validated that the user registered before
	const user = await User.findOne({ email: email });

	// 401 Unauthorized
	if (!user) {
		return res.status(401).send({
			Status: "Auth Failed (Invalid Credentials)",
			success: false,
			status: 401,
		});
	}

	// Compare password
	const isPasswordCorrect = await user.comparePassword(password);

	if (!isPasswordCorrect) {
		return res.status(401).send({
			Status: "Auth Failed (Invalid Credentials)",
			success: false,
			status: 401,
		});
	}

	// Send back only the user and token (dont send the password)
	const token = user.createJWT();

	return res.status(200).send({
		message: "Auth successful",
		success: true,
		status: 200,
		user: {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			dateOfBirth: user.dateOfBirth,
			gender: user.gender,
			joinedDate: user.joinedDate,
		},
		token: token,
	});
};

// Handling delete Request to delete user
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
		message: "Successfully deleted user by given id",
		success: true,
		status: 200,
	});
};
