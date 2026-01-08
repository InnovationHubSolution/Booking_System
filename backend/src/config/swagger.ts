import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vanuatu Booking System API',
            version: '1.0.0',
            description: 'Comprehensive booking and reservation platform for Vanuatu tourism',
            contact: {
                name: 'API Support',
                email: 'support@vanuatubooking.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://api.vanuatubooking.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', enum: ['customer', 'host', 'admin'] },
                        isHost: { type: 'boolean' },
                        verified: { type: 'boolean' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        reservationNumber: { type: 'string' },
                        bookingDate: { type: 'string', format: 'date-time' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show']
                        },
                        bookingType: {
                            type: 'string',
                            enum: ['property', 'service', 'flight', 'car-rental', 'transfer', 'package']
                        },
                        userId: { type: 'string' },
                        checkInDate: { type: 'string', format: 'date' },
                        checkOutDate: { type: 'string', format: 'date' },
                        pricing: {
                            type: 'object',
                            properties: {
                                unitPrice: { type: 'number' },
                                quantity: { type: 'number' },
                                subtotal: { type: 'number' },
                                taxAmount: { type: 'number' },
                                totalAmount: { type: 'number' },
                                currency: { type: 'string' },
                            },
                        },
                        payment: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'string',
                                    enum: ['unpaid', 'partial', 'paid', 'refunded', 'failed']
                                },
                                method: { type: 'string' },
                                paidAmount: { type: 'number' },
                            },
                        },
                    },
                },
                Property: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        propertyType: { type: 'string' },
                        location: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                city: { type: 'string' },
                                country: { type: 'string' },
                                coordinates: {
                                    type: 'array',
                                    items: { type: 'number' }
                                },
                            },
                        },
                        pricePerNight: { type: 'number' },
                        currency: { type: 'string' },
                        starRating: { type: 'number', minimum: 1, maximum: 5 },
                        amenities: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        errors: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints',
            },
            {
                name: 'Bookings',
                description: 'Booking and reservation management',
            },
            {
                name: 'Properties',
                description: 'Property listings and management',
            },
            {
                name: 'Flights',
                description: 'Flight search and booking',
            },
            {
                name: 'Services',
                description: 'Tours and activities',
            },
            {
                name: 'Payments',
                description: 'Payment processing and management',
            },
            {
                name: 'Reviews',
                description: 'Customer reviews and ratings',
            },
            {
                name: 'Resources',
                description: 'Resource allocation and availability',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Vanuatu Booking API Docs',
    }));

    // JSON spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('✅ Swagger documentation available at /api-docs');
};

export default swaggerSpec;
