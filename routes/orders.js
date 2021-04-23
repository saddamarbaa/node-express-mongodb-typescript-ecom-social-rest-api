/** @format */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/products");

// Handling Get Request to /orders
router.get("/", (req, res, next) => {
	// find all the orders
	Order.find()
		.populate("product")
		.select("quantity product _id")
		.exec() // .exec() method return promise
		.then((docs) => {
			// pass more information  with response
			const responseObject = {
				count: docs.length,
				orders: docs.map((doc) => {
					console.log(doc.product);
					return {
						quantity: doc.name,
						product: doc.product,
						_id: doc._id,
						request: {
							type: "Get",
							description: "Get one order with the id",
							url: "http://localhost:3000/orders/" + doc._id,
						},
					};
				}),
			};

			res.status(200).send({
				result: responseObject,
				message: "Successful Found all product",
			});
		})
		.catch((error) => {
			res.status(404).send({
				message: "Order by given id not found",
				error: error,
			});
		});
});

// Handling Post Request to /order
router.post("/", (req, res, next) => {
	// Validated the product in DB first
	Product.findById(req.body.productId)
		.exec()
		.then((product) => {
			// if product is null
			if (product === null) {
				return res.status(404).send({
					message: "Product is not found",
				});
			}
			// create new order
			const order = new Order({
				_id: new mongoose.Types.ObjectId(),
				quantity: req.body.quantity,
				product: req.body.productId,
			});

			// save the order
			order
				.save()
				.then((result) => {
					// HTTP Status 201 indicates that as a result of HTTP POST  request,
					//  one or more new resources have been successfully created on server
					res.status(201).send({
						message: "Order Successfully Stored",
						CreatedOrderObject: {
							quantity: result.quantity,
							product: product,
							_id: result._id,
							request: {
								type: "Get",
								description: "Get one order with the id",
								url: "http://localhost:3000/orders/" + result._id,
							},
						},
					});
				})
				.catch((error) => {
					// 500 Internal Server Error
					res.status(500).send({
						message: "unable to save to database",
						error: error,
					});
				});
		})
		.catch((error) => {
			res.status(404).send({
				message: "Product by given id not found",
				error: error,
			});
		});
});

// Handling individual Request to /orders
router.get("/:orderId", (req, res, next) => {
	const id = req.params.orderId;

	Order.findById(id)
		.populate("product")
		.select("name price _id")
		.exec() // .exec() method return promise
		.then((docs) => {
			if (docs) {
				res.status(200).send({
					message: "Successfully Found the order",
					order: {
						quantity: docs.quantity,
						product: docs.product,
						_id: docs._id,
						request: {
							type: "Get",
							description: "Get all the order",
							url: "http://localhost:3000/orders/",
						},
					},
				});
			} else {
				// if the id is not found in db it return null
				res.status(404).send({
					product: doc,
					message: "no valid entry found for provided ID",
				});
			}
		})
		.catch((error) => {
			// 500 Internal Server Error
			res.status(500).send({
				message: "Internal Server Error(invalid id)",
				error: error,
			});
		});
});

// Handling deleting individual order
router.delete("/:orderId", (req, res, next) => {
	const id = req.params.orderId;
	// also we can use remove
	Order.deleteOne({ _id: id })
		.exec() // .exec() method return promise
		.then((docs) => {
			if (docs) {
				res.status(200).send({
					message: "Successfully deleted the order",
					request: {
						type: "Post",
						description: "You can post new order",
						url: "http://localhost:3000/orders/",
						data: {
							quantity: "number",
							product: "mongoose.Types.ObjectId",
						},
					},
				});
			}
		})
		.catch((error) => {
			console.log(error);
			// 500 Internal Server Error
			res.status(500).send({
				message: "Internal Server Error(invalid id)",
				error: error,
			});
		});
});

module.exports = router;
