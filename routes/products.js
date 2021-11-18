/** @format */

const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import Middleware function to authenticate token From different file
const authenticateToken = require("../middleware/auth/check-auth");

const getImageExtension = require("../lib/getImageExtension");
const productsController = require("../controllers/products.controller");

// Set Storage Engine
// Configuring and validating the upload
const storage = multer.diskStorage({
	destination: (req, file, callbackFunction) => {
		callbackFunction(null, "public/uploads");
	},

	// By default, multer removes file extensions so let's add them back
	filename: (req, file, callbackFunction) => {
		callbackFunction(
			null,
			`${file.fieldname}-${Date.now()}${getImageExtension(file.mimetype)}`,
		);
	},
});

// Initialize upload variable
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 10, // accept files up 10 mgb
	},
});

// Handling Post Request to /api/v1/products
router.post(
	"/",
	authenticateToken,
	upload.single("productImage"),
	productsController.products_create_product,
);

// Handling Get Request to /api/v1/products
router.get("/", productsController.products_get_all_product);

// Handling individual Request to /api/v1/products
router.get("/:productId", productsController.products_get_one_product);

// Handling updating individual /api/v1/products
router.patch(
	"/:productId",
	authenticateToken,
	productsController.products_update_product,
);

// Handling deleting individual product
router.delete(
	"/:productId",
	authenticateToken,
	productsController.products_delete_product,
);

module.exports = router;
