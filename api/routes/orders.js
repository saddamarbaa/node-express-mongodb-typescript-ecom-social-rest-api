/** @format */

const express = require("express");
const router = express.Router();

// Handling Get Request to /orders
router.get("/", (req, res, next) => {
	res.status(200).send({
		message: "Handling Get Request to /orders",
	});
});

// Handling Post Request to /orders
router.post("/", (req, res, next) => {
	res.status(200).send({
		message: "Handling Post Request to /orders",
	});
});

// Handling individual Request to /orders
router.get("/:orderId", (req, res, next) => {
	const id = req.params.orderId;
	if (id === "saddam") {
		res.status(200).send({
			message: "You Got the special Id",
			id: id,
		});
	} else {
		res.status(404).send({
			message: "Order not found",
		});
	}
});

// Handling updating individual /orders
router.patch("/:orderId", (req, res, next) => {
	const id = req.params.orderId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Updated Order",
			id: id,
		});
	} else {
		res.status(404).send({
			message: "Order not found",
		});
	}
});

// Handling deleting individual Order
router.delete("/:orderId", (req, res, next) => {
	const id = req.params.orderId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Deleted Order",
			id: id,
		});
	} else {
		res.status(404).send({
			message: "Order not found",
		});
	}
});

module.exports = router;
