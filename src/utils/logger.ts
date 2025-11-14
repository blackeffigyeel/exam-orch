import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { TransformableInfo } from 'logform';

// Create logger transports
const transports: winston.transport[] = [
  // Log to console with readable format
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf((info: TransformableInfo & { context?: string; errorName?: string; stackTrace?: string }) => {
        let logMessage = `${info.timestamp} [${info.context ?? 'ExamOrch'}] ${info.level}: ${info.message}`;

        // Include error details if present
        if (info.errorName) logMessage += `\nError Type: ${info.errorName}`;
        if (info.stackTrace) {
          // Extract file path and line number from stack
          const lines = info.stackTrace.split('\n');
          if (lines.length > 1) {
            const match = lines[1].match(/\((.*):(\d+):\d+\)/);
            if (match) {
              const [, filePath, line] = match;
              logMessage += `\nFile: ${path.basename(filePath)}, Line: ${line}`;
            }
          }
        }

        const { timestamp, level, message, context, errorName, stackTrace, ...rest } = info;

        // Include additional info if present
        if (Object.keys(rest).length > 0) {
          logMessage += `\nAdditional Info: ${JSON.stringify(rest)}`;
        }

        return logMessage;
      })
    ),
  }),

  // Log to daily rotating files
  new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: winston.format.json(),
  transports,
});

// Define logging functions

/**
 * Log an informational message
 */
export function info(message: string, context?: string, additionalInfo?: Record<string, unknown>) {
  logger.info(message, { context, ...additionalInfo });
}

/**
 * Log a debug message
 */
export function debug(message: string, context?: string, additionalInfo?: Record<string, unknown>) {
  logger.debug(message, { context, ...additionalInfo });
}

/**
 * Log a warning
 */
export function warn(message: string, context?: string, additionalInfo?: Record<string, unknown>) {
  logger.warn(message, { context, ...additionalInfo });
}

/**
 * Log an error with optional error object
 */
export function error(message: string, context?: string, additionalInfo?: { error?: Error } & Record<string, unknown>) {
  const { error: err, ...rest } = additionalInfo ?? {};
  logger.error(message, {
    context,
    errorName: err?.name,
    stackTrace: err?.stack,
    ...rest,
  });
}

// Export the logger instance for direct use if needed
export default logger;
