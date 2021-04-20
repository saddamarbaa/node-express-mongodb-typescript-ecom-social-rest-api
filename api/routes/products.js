/** @format */

const express = require("express");
const router = express.Router();

// Handling Get Request to /product
router.get("/", (req, res, next) => {
	res.status(200).send({
		message: "Handling Get Request to /products",
	});
});

// Handling Post Request to /product
router.post("/", (req, res, next) => {
	const product = {
		name: req.body.name,
		price: req.body.price,
	};

	res.status(200).send({
		message: "Handling Post Request to /products",
		CreatedProduct: product,
	});
});

// Handling individual Request to /product
router.get("/:productId", (req, res, next) => {
	const id = req.params.productId;
	if (id === "saddam") {
		res.status(200).send({
			message: "You Got the special Id",
			id: id,
		});
	}
});

// Handling updating individual product
router.patch("/:productId", (req, res, next) => {
	const id = req.params.productId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Updated product",
			id: id,
		});
	}
});

// Handling deleting individual product
router.delete("/:productId", (req, res, next) => {
	const id = req.params.productId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Deleted product",
			id: id,
		});
	}
});

module.exports = router;
