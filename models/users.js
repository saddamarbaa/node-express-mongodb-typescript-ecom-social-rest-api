/** @format */

// Import the mongoose module from node_modules
const mongoose = require("mongoose");

// Defining a Model and Creating a Database Schema
// define user schema
const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	email: {
		type: String,
		required: true,
		unique: true,
		// a regular expression to validate an email address(stackoverflow)
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
	},
	password: {
		type: String,
		required: true,
	},
});

// Export Model
// Compile model from userSchema
module.exports = mongoose.model("User", userSchema);
