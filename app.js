/** @format */

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// HTTP request logger middleware for node.js
const morgan = require("morgan");

// Require dotenv(to manage secrets and configs)
// Using dotenv package to create environment variables
const dotenv = require("dotenv");
dotenv.config();

const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");

// Access Environment variables
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

// Connect mongoose to MongoDB  Database.
mongoose
	.connect(
		`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.qupxt.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		},
	)
	.then(() =>
		console.log("MongoDB database connection established successfully ..."),
	)
	.catch((error) => console.log("MongoDB connection error:", error));

// Log the request
app.use(morgan("dev"));

// Parse incoming data
app.use(express.json());

// Enable All CORS Requests
app.use(cors());

// Routes which Should handle the requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

// Public file
// Serve all static files inside public directory.
app.use("/uploads", express.static("uploads"));

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
