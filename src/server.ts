import app from '@src/app';
import { connectDB, environmentConfig } from '@src/configs';

import logger from '@src/logger';

// env setup
const env = process.env.NODE_ENV;

// Connecting to MongoDB and Starting Server
export const startServer = async () => {
  try {
    const conn: any = await connectDB(
      env === 'testing'
        ? environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING
        : environmentConfig.MONGODB_CONNECTION_STRING
    );

    console.log(`MongoDB database connection established successfully to... ${conn?.connection?.host}`.cyan.underline);

    app?.listen(environmentConfig.PORT, () => {
      console.log(`Server is listening on port: http://localhost:${environmentConfig.PORT} ....`.inverse);
    });
  } catch (error: any) {
    console.log('MongoDB connection error. Please make sure MongoDB is running: ');

    logger.error({
      message: `MongoDB connection error. Please make sure MongoDB is running: ${error?.message}`,
    });
  }
};

// Establish http server connection
startServer();

export default app;
