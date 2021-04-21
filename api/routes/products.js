/** @format */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/products");

// Handling Get Request to /product
router.get("/", (req, res, next) => {
	// find all the product
	Product.find()
		.exec() // .exec() method return promise
		.then((doc) => {
			console.log(doc);
			if (doc.length > 0) {
				res.status(200).send({
					product: doc,
					message: "Successful Found all product",
				});
			} else {
				//  if no product found in db return null
				res.status(404).send({
					product: doc,
					message: "no product is found in db",
				});
			}
		})
		.catch((error) => {
			console.log(error);
			// 500 Internal Server Error
			res.status(500).send({
				message: "Internal Server Error",
				error: error,
			});
		});
});

// Handling Post Request to /product
router.post("/", (req, res, next) => {
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
	});

	product
		.save()
		.then((result) => {
			console.log(result);
			res.status(200).send({
				message: "item saved to database",
				message: "Handling Post Request to /products",
				CreatedProduct: product,
			});
		})
		.catch((error) => {
			console.log(error);
			// 500 Internal Server Error
			res.status(500).send({
				message: "unable to save to database",
				error: error,
			});
		});
});

// Handling individual Request to /product
router.get("/:productId", (req, res, next) => {
	const id = req.params.productId;

	Product.findById(id)
		.exec() // .exec() method return promise
		.then((doc) => {
			console.log(doc);
			if (doc) {
				res.status(200).send({
					product: doc,
					message: "Successful Found the product",
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
			console.log(error);
			// 500 Internal Server Error
			res.status(500).send({
				message: "Internal Server Error(invalid id",
				error: error,
			});
		});
});

// Handling updating individual product
router.patch("/:productId", (req, res, next) => {
	const id = req.params.productId;
	const updateOperation = {};

	// excepting user to send an array of object
	for (const operation of req.body) {
		updateOperation[operation.operationName] = operation.value;
	}

	// update the product
	Product.updateOne(
		{ _id: id },
		{
			// $set is mongoose thing we need while updating
			$set: updateOperation,
		},
	)
		.exec() // .exec() method return promise
		.then((doc) => {
			// console.log(doc);
			if (doc) {
				res.status(200).send({
					message: "product is been Updated",
					id: id,
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

// Handling deleting individual product
router.delete("/:productId", (req, res, next) => {
	const id = req.params.productId;
	// also we can use remove
	Product.deleteOne({ _id: id })
		.exec() // .exec() method return promise
		.then((doc) => {
			console.log(doc);
			if (doc) {
				res.status(200).send({
					message: "Deleted product",
					id: id,
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
