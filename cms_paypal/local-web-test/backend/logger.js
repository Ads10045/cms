const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./config/env');

// Create logs directories if they don't exist outside the project folder
const baseLogDir = path.join(__dirname, '../../logs/local-web-test');
const backendLogDir = path.join(baseLogDir, 'backend');
const frontendLogDir = path.join(baseLogDir, 'frontend');

if (!fs.existsSync(backendLogDir)) {
  fs.mkdirSync(backendLogDir, { recursive: true });
}
if (!fs.existsSync(frontendLogDir)) {
  fs.mkdirSync(frontendLogDir, { recursive: true });
}

// Formatting for the logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
);

// Logger for startup events (Database connection, Server start)
const startupLogger = winston.createLogger({
  level: config.logger.level,
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: path.join(backendLogDir, 'startup.log') }),
    new winston.transports.Console() // Keep console output for visibility
  ]
});

// Logger for application events (API requests, errors)
const appLogger = winston.createLogger({
  level: config.logger.level,
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: path.join(backendLogDir, 'application.log') }),
    new winston.transports.Console() // Keep console output for visibility
  ]
});

// Logger for frontend events
const frontendLogger = winston.createLogger({
  level: config.logger.level,
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: path.join(frontendLogDir, 'frontend.log') }),
    new winston.transports.Console()
  ]
});

module.exports = { startupLogger, appLogger, frontendLogger };
