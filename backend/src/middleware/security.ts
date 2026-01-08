import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// Helmet security headers
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
            connectSrc: ["'self'", "https://maps.googleapis.com"],
            frameSrc: ["'self'", "https://www.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Sanitize MongoDB queries (prevent NoSQL injection)
export const sanitizeData = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized suspicious input: ${key} in ${req.method} ${req.path}`);
    }
});

// XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
    // Basic XSS protection - sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};

// Helper function to sanitize objects
function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
        return obj
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
}

// HTTP Parameter Pollution protection
export const hppProtection = (req: Request, res: Response, next: NextFunction) => {
    // Prevent parameter pollution by only allowing single values
    if (req.query) {
        for (const key in req.query) {
            if (Array.isArray(req.query[key]) && !isArrayAllowed(key)) {
                req.query[key] = (req.query[key] as string[])[0];
            }
        }
    }
    next();
};

// List of parameters that are allowed to be arrays
const arrayAllowedParams = ['amenities', 'features', 'categories', 'tags', 'ids'];

function isArrayAllowed(param: string): boolean {
    return arrayAllowedParams.some(allowed => param.toLowerCase().includes(allowed));
}

// CSRF token validation (for forms)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF for API calls with valid JWT
    if (req.headers.authorization) {
        return next();
    }

    // Check for CSRF token in header
    const csrfToken = req.headers['x-csrf-token'] as string;
    const sessionToken = (req.session as any)?.csrfToken;

    if (!csrfToken || csrfToken !== sessionToken) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'Request rejected due to invalid CSRF token'
        });
    }

    next();
};

// Content-Type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
    // Only validate for POST, PUT, PATCH requests with body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];

        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({
                error: 'Unsupported Media Type',
                message: 'Content-Type must be application/json'
            });
        }
    }
    next();
};

// Request size limit validation
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Payload Too Large',
            message: `Request body must be less than ${maxSize / 1024 / 1024}MB`
        });
    }
    next();
};
