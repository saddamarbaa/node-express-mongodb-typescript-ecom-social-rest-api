// Import all the dependencies
const express = require('express');
const expressAyncErrors = require('express-async-errors');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');

// Initialize app with express
const app = express();

// Import DB
const connectDB = require('./configs/db.config');

// Import Middlewares
const notFoundMiddleware = require('./middlewares/errors/not-found');
const errorHandlerMiddleware = require('./middlewares/errors/error-handler');

// Import custom logger
const logger = require('./logger/index');

// Import Routes
const productRoutes = require('./routes/products.route');
const orderRoutes = require('./routes/orders.route');
const adminRoutes = require('./routes/admin.route');
const authRoutes = require('./routes/auth.route');

// Access Environment variables
const { MONGODB_CONNECTION_STRING, PORT, NODE_ENV } = require('./configs/environment.config');

// Load App Middlewares

// Log the request
app.use(morgan('dev'));

// Determine which domain can access the website
app.use(cors());

// Parses incoming requests with JSON payloads
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve all static files inside public directory.
app.use('/static', express.static('public'));

// Routes which Should handle the requests
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Connecting to MongoDB and Starting Server
const start = async () => {
  try {
    const conn = await connectDB(MONGODB_CONNECTION_STRING);

    console.log(`MongoDB database connection established successfully to... ${conn?.connection?.host}`.cyan.underline);

    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`.inverse));

    // logger.error({
    //   message: `MongoDB database connection established successfully ...`,
    // });
  } catch (error) {
    console.log('MongoDB connection error. Please make sure MongoDB is running: ', error?.message);
    logger.error({
      message: `MongoDB connection error. Please make sure MongoDB is running: ${error?.message}`
    });
  }
};

// Establish http server connection
start();
