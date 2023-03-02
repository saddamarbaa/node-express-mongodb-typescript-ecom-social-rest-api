import app from '@src/app';
import logger from '@src/logger';
import { connectDB, environmentConfig } from '@src/configs';
import { initSocket } from '@src/socket';

// env setup
const env = process.env.NODE_ENV;

// Connecting to MongoDB and Starting Server
export const startHttpServer = async () => {
  try {
    const conn = await connectDB(
      env === 'testing'
        ? environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING
        : environmentConfig.MONGODB_CONNECTION_STRING
    );

    console.log(`MongoDB database connection established successfully to... ${conn?.connection?.host}`.cyan.underline);

    // Create the server and the Socket.IO instance
    const server = app?.listen(environmentConfig.PORT, () => {
      console.log(`Server is listening on port: http://localhost:${environmentConfig.PORT} ....`.inverse);
    });

    if (!server) {
      throw new Error('Failed to start server.');
    }

    initSocket(server);
  } catch (error) {
    console.log('MongoDB connection error. Please make sure MongoDB is running: ');

    logger.error({
      message: `MongoDB connection error. Please make sure MongoDB is running: ${(error as Error)?.message}`,
    });
  }
};

// Establish http server connection
startHttpServer();

export default app;
