/** @format */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/products");

// Import Middleware function to authenticate token From different file
const authenticateToken = require("../auths/auth");

// Import multer from node_modules
const multer = require("multer");

// Set Storage Engine
// Configuring and validating the upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads");
	},

	// By default, multer removes file extensions so let's add them back
	filename: (req, file, cb) => {
		cb(
			null,
			`${file.fieldname}-${Date.now()}${getImageExtension(file.mimetype)}`,
		);
	},
});

// Check Image Extension
const getImageExtension = (mimetype) => {
	switch (mimetype) {
		case "image/png":
			return ".png";
		case "image/PNG":
			return ".PNG";
		case "image/jpg":
			return ".jpg";
		case "image/JPG":
			return ".JPG";
		case "image/JPEG":
			return ".JPEG";
		case "image/jpeg":
			return ".jpeg";
		case "image/webp":
			return ".webp";
	}
};

// Initialize upload variable
const upload = multer({ storage: storage });

// Handling Get Request to /product
router.get("/", (req, res, next) => {
	// find all the product
	Product.find()
		.select("name price _id productImage")
		.exec() // .exec() method return promise
		.then((docs) => {
			// pass more information  with response
			const responseObject = {
				count: docs.length,
				products: docs.map((doc) => {
					return {
						productImage: doc.productImage,
						name: doc.name,
						price: doc.price,
						_id: doc._id,

						request: {
							type: "Get",
							description: "Get one product with the id",
							url: "http://localhost:3000/products/" + doc._id,
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
			console.log(error);
			// 500 Internal Server Error
			res.status(500).send({
				message: "Internal Server Error",
				error: error,
			});
		});
});

// Handling Post Request to /product
router.post(
	"/",
	authenticateToken,
	upload.single("productImage"),
	(req, res) => {
		const image = req.file;
		const product = new Product({
			_id: new mongoose.Types.ObjectId(),
			name: req.body.name,
			price: req.body.price,
			productImage: `uploads/${req.file.filename}`,
		});

		product
			.save()
			.then((result) => {
				// HTTP Status 201 indicates that as a result of HTTP POST  request,
				//  one or more new resources have been successfully created on server
				res.status(201).send({
					message: "Created Product Successfully",
					CreatedProduct: {
						name: result.name,
						price: result.price,
						productImage: result.productImage,
						_id: result._id,
						request: {
							type: "Get",
							description: "Get one product with the id",
							url: "http://localhost:3000/products/" + result._id,
						},
					},
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
	},
);

// Handling individual Request to /product
router.get("/:productId", (req, res, next) => {
	const id = req.params.productId;

	Product.findById(id)
		.select("name price _id productImage")
		.exec() // .exec() method return promise
		.then((docs) => {
			if (docs) {
				res.status(200).send({
					message: "Successfully Found the product",
					products: {
						productImage: docs.productImage,
						name: docs.name,
						price: docs.price,
						_id: docs._id,
						request: {
							type: "Get",
							description: "Get all the products",
							url: "http://localhost:3000/products/",
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

// Handling updating individual product
router.patch("/:productId", authenticateToken, (req, res, next) => {
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
		.then((docs) => {
			if (docs) {
				res.status(200).send({
					message: "Successfully Updated the product",
					UpdateProduct: updateOperation,
					_id: id,
					request: {
						type: "Get",
						description: "Get one product with the id",
						url: "http://localhost:3000/products/" + id,
					},
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

// Handling deleting individual product
router.delete("/:productId", authenticateToken, (req, res, next) => {
	const id = req.params.productId;
	// also we can use remove
	Product.deleteOne({ _id: id })
		.exec() // .exec() method return promise
		.then((docs) => {
			if (docs) {
				res.status(200).send({
					message: "Successfully deleted the product",
					request: {
						type: "Post",
						description: "You can post new Product",
						url: "http://localhost:3000/products/",
						data: { name: "string", price: "Number" },
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
