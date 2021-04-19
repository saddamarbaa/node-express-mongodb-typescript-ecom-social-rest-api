/** @format */

const express = require("express");
const router = express.Router();

// Handling Get Request to /products
router.get("/", (req, res, next) => {
	res.status(200).send({
		message: "Handling Get Request to /products",
	});
});

// Handling Post Request to /products
router.post("/", (req, res, next) => {
	res.status(200).send({
		message: "Handling Post Request to /products",
	});
});

// Handling individual Request to /products
router.get("/:productId", (req, res, next) => {
	const id = req.params.productId;
	if (id === "saddam") {
		res.status(200).send({
			message: "You Got the special Id",
			id: id,
		});
	} else {
		res.status(404).send({
			message: "product not found",
		});
	}
});

// Handling updating individual products
router.patch("/:productId", (req, res, next) => {
	const id = req.params.productId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Updated product",
			id: id,
		});
	} else {
		res.status(404).send({
			message: "product not found",
		});
	}
});

// Handling deleting individual products
router.delete("/:productId", (req, res, next) => {
	const id = req.params.productId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Deleted product",
			id: id,
		});
	} else {
		res.status(404).send({
			message: "product not found",
		});
	}
});

module.exports = router;
