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
		required: [true, "Please provide name to order"],
	},
	quantity: {
		type: Number,
		default: 1,
	},
});

// Compile model from schema and Exported
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
