import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),

    // Error log file (rotate daily)
    new DailyRotateFile({
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }),

    // Combined log file (all levels)
    new DailyRotateFile({
        filename: path.join(logsDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }),

    // HTTP requests log
    new DailyRotateFile({
        filename: path.join(logsDir, 'http-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'http',
        maxSize: '20m',
        maxFiles: '7d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Create a stream object for Morgan
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Helper methods for structured logging
export const logInfo = (message: string, meta?: any) => {
    logger.info(message, meta);
};

export const logError = (message: string, error?: any, meta?: any) => {
    logger.error(message, { error: error?.stack || error, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
    logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
    logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
    logger.http(message, meta);
};

// Log request details
export const logRequest = (req: any) => {
    logger.http('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id
    });
};

// Log response details
export const logResponse = (req: any, res: any, responseTime: number) => {
    logger.http('Response sent', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id
    });
};

export default logger;
