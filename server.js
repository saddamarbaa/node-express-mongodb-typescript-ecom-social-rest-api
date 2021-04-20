/** @format */

const http = require("http");

const PORT = process.env.PORT || 3000;

const app = require("./app");

// Create Server
const server = http.createServer(app);

server.listen(PORT);
