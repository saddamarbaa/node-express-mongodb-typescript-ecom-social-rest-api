import logger from '@src/logger';

process.on('unhandledRejection', (reason: Error | any) => {
  console.log(`Unhandled Rejection: ${reason.message || reason}`.red);

  throw new Error(reason.message || reason);
});

process.on('uncaughtException', (error: Error) => {
  console.log(`Uncaught Exception: ${error.message}`.inverse);

  logger.error({
    message: `Uncaught Exception: ${error.message}`,
  });

  // process.exit(1);
});
