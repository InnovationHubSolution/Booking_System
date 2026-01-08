import { Request, Response, NextFunction } from 'express';
import logger, { logError } from '../config/logger';

// Custom error class
export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logError('Error occurred', err, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: (req as any).user?.id
    });

    // Development environment - send full error
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production environment - send limited error info
        if (err.isOperational) {
            // Operational, trusted error: send message to client
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or unknown error: don't leak details
            logger.error('NON-OPERATIONAL ERROR:', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(
        `Cannot find ${req.originalUrl} on this server!`,
        404
    );
    next(error);
};

// Handle specific error types
export const handleCastError = (err: any): AppError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

export const handleDuplicateFields = (err: any): AppError => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} = '${value}'. Please use another value!`;
    return new AppError(message, 400);
};

export const handleValidationError = (err: any): AppError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

export const handleJWTError = (): AppError => {
    return new AppError('Invalid token. Please log in again!', 401);
};

export const handleJWTExpiredError = (): AppError => {
    return new AppError('Your token has expired! Please log in again.', 401);
};

// Unhandled rejection handler
export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err: Error) => {
        logger.error('UNHANDLED REJECTION! Shutting down...', err);
        process.exit(1);
    });
};

// Uncaught exception handler
export const handleUncaughtException = () => {
    process.on('uncaughtException', (err: Error) => {
        logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
        process.exit(1);
    });
};
