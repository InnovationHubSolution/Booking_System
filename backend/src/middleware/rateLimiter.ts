import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 'Check the Retry-After header'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: (req as any).rateLimit?.resetTime
        });
    }
});

// Stricter limiter for authentication routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many login attempts, please try again after 15 minutes'
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Too many attempts',
            message: 'Too many login/register attempts. Please try again after 15 minutes.',
            retryAfter: (req as any).rateLimit?.resetTime
        });
    }
});

// Limiter for password reset
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        error: 'Too many password reset requests, please try again after an hour'
    }
});

// Limiter for booking creation
export const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        error: 'Too many booking requests, please slow down'
    }
});

// Limiter for search endpoints
export const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: {
        error: 'Too many search requests, please slow down'
    }
});
