/** @format */

const express = require("express");
const router = express.Router();

// Handling Get Request to /order
router.get("/", (req, res, next) => {
	res.status(200).send({
		message: "Handling Get Request to /orders",
	});
});

// Handling Post Request to /order
router.post("/", (req, res, next) => {
	const order = {
		productId: req.body.productId,
		quantity: req.body.quantity,
	};

	res.status(200).send({
		message: "Handling Post Request to /orders",
		Order: order,
	});
});

// Handling individual Request to /order
router.get("/:orderId", (req, res, next) => {
	const id = req.params.orderId;
	if (id === "saddam") {
		res.status(200).send({
			message: "You Got the special Id",
			id: id,
		});
	}
});

// Handling updating individual /order
router.patch("/:orderId", (req, res, next) => {
	const id = req.params.orderId;
	if (id === "saddam") {
		res.status(200).send({
			message: "Updated Order",
			id: id,
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
	}
});

module.exports = router;
