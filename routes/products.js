/** @format */

const express = require("express");
const router = express.Router();

// Import Middleware function to authenticate token From different file
const authenticateToken = require("../auths/auth");

const productsController = require("../controllers/products");

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

// Handling Post Request to /product
router.post(
	"/",
	authenticateToken,
	upload.single("productImage"),
	productsController.products_create_product,
);

// Handling Get Request to /product
router.get("/", productsController.products_get_all_product);

// Handling individual Request to /product
router.get(
	"/:productId",
	authenticateToken,
	productsController.products_get_one_product,
);

// Handling updating individual product
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
