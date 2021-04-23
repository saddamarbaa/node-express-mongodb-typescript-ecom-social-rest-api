/** @format */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/users");

// Handling Post Request to /User
router.post("/signup", (req, res, next) => {
	// validated that the user was not registered before
	User.find({ email: req.body.email })
		.exec()
		.then((user) => {
			console.log(user);
			if (user.length >= 1) {
				// also we can send  422
				return res.status(409).send({
					Message: "Email Already Exits",
				});
			} else {
				// by now we are sure that the user was not registered before
				bcrypt.hash(req.body.password, 10, function (err, hash) {
					if (err) {
						return res.status(500).send({
							error: error,
						});
					} else {
						const newUser = new User({
							_id: new mongoose.Types.ObjectId(),
							email: req.body.email,
							password: hash,
						});

						newUser
							.save()
							.then((result) => {
								// HTTP Status 201 indicates that as a result of HTTP POST  request,
								//  one or more new resources have been successfully created on server
								console.log(result);
								res.status(201).send({
									message: "Created  Successfully",
								});
							})
							.catch((error) => {
								console.log(error);
								// 500 Internal Server Error
								res.status(500).send({
									message: "unable to save to user to database",
									error: error,
								});
							});
					}
				});
			}
		});
});

// Handling delete Request to delete user
router.delete("/:userId", (req, res, next) => {
	User.remove({ _id: req.params.userId })
		.exec()
		.then((result) => {
			res.status(200).send({
				message: "User Deleted",
			});
		})
		.catch((error) => {
			res.status(500).send({
				error: error,
			});
		});
});

module.exports = router;
