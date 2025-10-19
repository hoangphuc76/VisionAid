/**
 * Logger Configuration
 * Winston logger setup for application logging
 */

const winston = require('winston');

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
});

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'visionaid-be' },
  transports: [
    // Write errors to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Console transport for development
// if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${service}] ${level}: ${message} ${metaString}`;
      })
    ),
  }));
// }

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

module.exports = logger;
