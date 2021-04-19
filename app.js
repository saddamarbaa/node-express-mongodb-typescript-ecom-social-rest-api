/** @format */

const express = require("express");
const app = express();

app.use((req, res, next) => {
	res.status(200).send({
		message: "its work",
	});
});

module.exports = app;
