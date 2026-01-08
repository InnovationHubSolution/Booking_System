import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

/**
 * Validation middleware factory
 * Creates middleware to validate request body, query, or params using Joi schema
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown properties
            convert: true // Type coercion
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return next(new AppError('Validation failed', 400));
        }

        // Replace request data with validated data
        req[property] = value;
        next();
    };
};

/**
 * Common validation schemas
 */
export const schemas = {
    // User registration
    register: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                'any.required': 'Password is required'
            }),
        firstName: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s'-]+$/)
            .required()
            .messages({
                'string.min': 'First name must be at least 2 characters',
                'string.max': 'First name must not exceed 50 characters',
                'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s'-]+$/)
            .required()
            .messages({
                'string.min': 'Last name must be at least 2 characters',
                'string.max': 'Last name must not exceed 50 characters',
                'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
                'any.required': 'Last name is required'
            }),
        phone: Joi.string()
            .pattern(/^\+?[1-9]\d{1,14}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Please provide a valid phone number in E.164 format'
            })
    }),

    // User login
    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Password is required'
            })
    }),

    // Property booking
    propertyBooking: Joi.object({
        propertyId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid property ID format',
                'any.required': 'Property ID is required'
            }),
        roomType: Joi.string()
            .required()
            .messages({
                'any.required': 'Room type is required'
            }),
        checkInDate: Joi.date()
            .min('now')
            .required()
            .messages({
                'date.min': 'Check-in date must be in the future',
                'any.required': 'Check-in date is required'
            }),
        checkOutDate: Joi.date()
            .greater(Joi.ref('checkInDate'))
            .required()
            .messages({
                'date.greater': 'Check-out date must be after check-in date',
                'any.required': 'Check-out date is required'
            }),
        guestCount: Joi.number()
            .integer()
            .min(1)
            .max(20)
            .required()
            .messages({
                'number.min': 'At least 1 guest is required',
                'number.max': 'Maximum 20 guests allowed',
                'any.required': 'Guest count is required'
            }),
        guestDetails: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
            nationality: Joi.string().optional(),
            passportNumber: Joi.string().optional()
        }).required(),
        specialRequests: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.max': 'Special requests must not exceed 500 characters'
            }),
        discountCode: Joi.string()
            .optional(),
        currency: Joi.string()
            .length(3)
            .uppercase()
            .optional()
            .default('USD')
            .messages({
                'string.length': 'Currency code must be 3 characters (ISO 4217)'
            })
    }),

    // Service booking
    serviceBooking: Joi.object({
        serviceId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid service ID format',
                'any.required': 'Service ID is required'
            }),
        bookingDate: Joi.date()
            .min('now')
            .required()
            .messages({
                'date.min': 'Booking date must be in the future',
                'any.required': 'Booking date is required'
            }),
        timeSlot: Joi.string()
            .required()
            .messages({
                'any.required': 'Time slot is required'
            }),
        participants: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .required()
            .messages({
                'number.min': 'At least 1 participant is required',
                'number.max': 'Maximum 50 participants allowed',
                'any.required': 'Number of participants is required'
            }),
        guestDetails: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
        }).required(),
        specialRequests: Joi.string()
            .max(500)
            .optional()
    }),

    // Review creation
    createReview: Joi.object({
        bookingId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
        rating: Joi.number()
            .integer()
            .min(1)
            .max(5)
            .required()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating must not exceed 5',
                'any.required': 'Rating is required'
            }),
        comment: Joi.string()
            .min(10)
            .max(1000)
            .required()
            .messages({
                'string.min': 'Review must be at least 10 characters',
                'string.max': 'Review must not exceed 1000 characters',
                'any.required': 'Review comment is required'
            }),
        photos: Joi.array()
            .items(Joi.string().uri())
            .max(5)
            .optional()
            .messages({
                'array.max': 'Maximum 5 photos allowed'
            })
    }),

    // Password reset request
    forgotPassword: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            })
    }),

    // Password reset
    resetPassword: Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'Reset token is required'
            }),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                'any.required': 'Password is required'
            })
    }),

    // Pagination
    pagination: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .optional()
            .default(1),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .optional()
            .default(10),
        sortBy: Joi.string()
            .optional(),
        sortOrder: Joi.string()
            .valid('asc', 'desc')
            .optional()
            .default('desc')
    }),

    // Search properties
    searchProperties: Joi.object({
        location: Joi.string().optional(),
        checkIn: Joi.date().min('now').optional(),
        checkOut: Joi.date().greater(Joi.ref('checkIn')).optional(),
        guests: Joi.number().integer().min(1).max(20).optional(),
        minPrice: Joi.number().min(0).optional(),
        maxPrice: Joi.number().greater(Joi.ref('minPrice')).optional(),
        propertyType: Joi.string().optional(),
        amenities: Joi.alternatives().try(
            Joi.string(),
            Joi.array().items(Joi.string())
        ).optional(),
        starRating: Joi.number().integer().min(1).max(5).optional(),
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).max(100).optional().default(10)
    }),

    // MongoDB ObjectId
    objectId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'Invalid ID format'
        })
};

/**
 * Sanitize input to prevent XSS attacks
 * Note: This is an additional layer, main XSS protection is in security middleware
 */
export const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .trim();
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const key in input) {
            if (input.hasOwnProperty(key)) {
                sanitized[key] = sanitizeInput(input[key]);
            }
        }
        return sanitized;
    }

    return input;
};

/**
 * Middleware to sanitize all request inputs
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }
    if (req.query) {
        req.query = sanitizeInput(req.query);
    }
    if (req.params) {
        req.params = sanitizeInput(req.params);
    }
    next();
};

export default { validate, schemas, sanitizeRequest, sanitizeInput };
