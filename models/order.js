/** @format */

// Import the mongoose module from node_modules
const mongoose = require("mongoose");

// Defining a Model and Creating a Database Schema
// define product schema
const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	// connect to product  model

	product: {
		type: mongoose.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	quantity: {
		type: Number,
		default: 1,
	},
});

// Export model
// Compile model from order
module.exports = mongoose.model("Order", orderSchema);
