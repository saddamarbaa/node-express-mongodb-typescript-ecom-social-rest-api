/**
 * Requiring `winston-mongodb` will expose
 * `winston.transports.MongoDB`
 */

const winston = require('winston');
const winstonMongodb = require('winston-mongodb');

const { MONGODB_CONNECTION_STRING, PORT } = require('../configs/environment.config');

function buildDevLogger() {
  return winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      // Store in File
      new winston.transports.File({
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
      }),
      // log in console
      new winston.transports.Console(),

      // Store in DB
      // new winston.transports.MongoDB({
      //   level: 'error',
      //   db: MONGODB_CONNECTION_STRING,
      //   options: { poolSize: 2, autoReconnect: true, useNewUrlParser: true, useUnifiedTopology: true },
      // }),
    ],
  });
}

module.exports = buildDevLogger;
