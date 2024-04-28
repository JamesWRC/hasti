import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';


const hformat = winston.format.printf(
    ({ level, label, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]${
        label ? `[${label}]` : ''
      }: ${message} `;
      if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
      }
      return msg;
    }
  );

// Define log file rotation options
const transport = new DailyRotateFile({
  dirname: 'logs', // Directory where log files will be stored
  filename: 'hasti-api-%DATE%.log', // File name pattern
  datePattern: 'YYYY-MM-DD', // Date pattern for rotation
  zippedArchive: true, // Compress rotated files
  maxSize: '20m', // Max size of each log file before rotation
  maxFiles: '14d', // Max number of days to keep rotated files
});

const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.timestamp(),
      hformat
    ),
  });

// Create Winston logger instance
const logger = winston.createLogger({
  transports: [
    // Add the console transport
    consoleTransport,
    // Add the DailyRotateFile transport
    transport
  ],
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    hformat
  ),
});

export default logger;