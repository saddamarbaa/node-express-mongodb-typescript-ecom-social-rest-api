/** @format */

const express = require("express");
const router = express.Router();

// Import Middleware function to authenticate token From different file
const authenticateToken = require("../auths/auth");

const ordersController = require("../controllers/orders");

// Handling Get Request to /orders
router.get("/", authenticateToken, ordersController.orders_get_all);

// Handling Post Request to /order
router.post("/", authenticateToken, ordersController.orders_create_order);

// Handling individual Request to /orders
router.get(
	"/:orderId",
	authenticateToken,
	ordersController.orders_get_one_order,
);

// Handling deleting individual order
router.delete("/:orderId", ordersController.orders_delete_order);

module.exports = router;
