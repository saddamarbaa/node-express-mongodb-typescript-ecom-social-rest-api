/** @format */

const express = require("express");
const app = express();
const cors = require("cors");

// HTTP request logger middleware for node.js
const morgan = require("morgan");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

// Log the request
app.use(morgan("dev"));

// Parse incoming data
app.use(express.json());

// Enable All CORS Requests
app.use(cors());

// Routes which Should handle the requests
app.use("/products", productRoutes);
app.use("/order", orderRoutes);

// Error Handling
// Handle error if the routes not found or there's any problem in DB connection
app.use((req, res, next) => {
	//Create an error and pass it to the next function
	const error = new Error("Not found");
	error.status = 404;
	next(error);
});

// Error Handling
// An error handling middleware
app.use((error, req, res, next) => {
	res.status(error.status || 500).send({
		error: {
			Message: error.message,
		},
	});
});

module.exports = app;
