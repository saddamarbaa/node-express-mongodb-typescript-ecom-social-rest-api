// Import all the dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv').config();

// Initialize app with express
const app = express();

// Import DB
const connectDB = require('./db/connect');

//  Import Middlewares
const notFoundMiddleware = require('./middleware/errors/not-found');
const errorHandlerMiddleware = require('./middleware/errors/error-handler');

// Import Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Access Environment variables
const { MONGODB_CONNECTION_STRING, PORT } = require('./lib/config');

// Middlewares

// Log the request
app.use(morgan('dev'));

// Determine which domain can access the website
app.use(cors());

// Parses incoming requests with JSON payloads
app.use(express.json());

// Serve all static files inside public directory.
app.use('/static', express.static('public'));

// Routes which Should handle the requests
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Connecting to MongoDB and Starting Server
const start = async () => {
  try {
    await connectDB(MONGODB_CONNECTION_STRING);
    console.log('MongoDB database connection established successfully ...');

    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
  } catch (error) {
    console.log('MongoDB connection error:', error);
  }
};

start();
