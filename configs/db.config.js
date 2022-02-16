const mongoose = require('mongoose');

// Connecting to MongoDB(Connecting to the Database)
const connectDB = url => {
  // @event connected: Emitted when this connection successfully connects to the db. May be emitted multiple times in reconnected scenarios
  mongoose.connection.on('connected', () => {
    console.log('MongoDB database connection established successfully');
  });

  // @event error: Emitted when an error occurs on this connection.
  mongoose.connection.on('error', err => {
    console.log('MongoDB connection error. Please make sure MongoDB is running: ', err.message);
  });

  // @event disconnected: Emitted after getting disconnected from the db
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB database connection is disconnected...');
  });

  // @event close: Emitted after we disconnected and onClose executed on all of this connections models.
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB database connection is disconnected due to app termination...');
      process.exit(0); // close database connection
    });
  });

  // mongoose.connect return promise
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
};

module.exports = connectDB;
