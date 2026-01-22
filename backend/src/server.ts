import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import http from 'http';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import serviceRoutes from './routes/services';
import propertyRoutes from './routes/properties';
import reviewRoutes from './routes/reviews';
import wishlistRoutes from './routes/wishlist';
import flightRoutes from './routes/flights';
import carRentalRoutes from './routes/carRentals';
import transferRoutes from './routes/transfers';
import packageRoutes from './routes/packages';
import resourceRoutes from './routes/resources';
import paymentRoutes from './routes/payments';
import advancedRoutes from './routes/advanced';
import promotionRoutes from './routes/promotions';
import auditRoutes from './routes/audit';
import analyticsRoutes from './routes/analytics';
import scenicToursRoutes from './routes/scenicTours';
import backupRoutes from './routes/backup';
import discountRoutes from './routes/discounts';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import { auditContextMiddleware } from './middleware/audit';
import { errorHandler, notFound, handleUncaughtException, handleUnhandledRejection } from './middleware/errorHandler';
import { securityHeaders, sanitizeData, xssProtection, hppProtection, validateContentType, validateRequestSize } from './middleware/security';
import { apiLimiter, authLimiter, searchLimiter, bookingLimiter } from './middleware/rateLimiter';
import logger, { stream } from './config/logger';
import { setupSwagger } from './config/swagger';
import { setupSocket } from './config/socket';

// Handle uncaught exceptions and rejections
handleUncaughtException();
handleUnhandledRejection();

dotenv.config();

const app = express();

const server = http.createServer(app);

// Setup Socket.io for real-time features
const io = setupSocket(server);

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(securityHeaders);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Request logging
app.use(morgan('combined', { stream }));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeData);
app.use(xssProtection);
app.use(hppProtection);
app.use(validateContentType);
app.use(validateRequestSize);

// Apply general API rate limiter
app.use('/api/', apiLimiter);

// Apply audit context middleware to all routes (after authentication)
app.use(auditContextMiddleware);

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/bookings', bookingLimiter, bookingRoutes);
app.use('/api/services', searchLimiter, serviceRoutes);
app.use('/api/properties', searchLimiter, propertyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/flights', searchLimiter, flightRoutes);
app.use('/api/car-rentals', carRentalRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/scenic-tours', searchLimiter, scenicToursRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Setup Swagger API documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Vanuatu Travel Hub API',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Vanuatu Booking System API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            bookings: '/api/bookings',
            properties: '/api/properties',
            flights: '/api/flights',
            carRentals: '/api/car-rentals',
            transfers: '/api/transfers',
            packages: '/api/packages',
            scenicTours: '/api/scenic-tours',
            services: '/api/services',
            payments: '/api/payments',
            discounts: '/api/discounts',
            reviews: '/api/reviews',
            wishlist: '/api/wishlist',
            notifications: '/api/notifications',
            analytics: '/api/analytics',
            promotions: '/api/promotions',
            resources: '/api/resources',
            advanced: '/api/advanced',
            audit: '/api/audit',
            backup: '/api/backup'
        }
    });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        seedDatabase();
    })
    .catch(err => console.error('MongoDB connection error:', err));

async function seedDatabase() {
    const Service = (await import('./models/Service')).default;
    const Property = (await import('./models/Property')).default;
    const User = (await import('./models/User')).default;
    const bcrypt = (await import('bcryptjs')).default;

    // Create default admin user
    const adminExists = await User.findOne({ email: 'admin@vanuatu.com' });
    let adminUser;
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        adminUser = await User.create({
            email: 'admin@vanuatu.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Vanuatu',
            phone: '+678 123 456',
            role: 'admin',
            isHost: true,
            verified: true
        });
        console.log('✅ Default admin created: admin@vanuatu.com / admin123');
    } else {
        adminUser = adminExists;
    }

    // Create host user
    const hostExists = await User.findOne({ email: 'host@vanuatu.com' });
    let hostUser;
    if (!hostExists) {
        const hashedPassword = await bcrypt.hash('host123', 10);
        hostUser = await User.create({
            email: 'host@vanuatu.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Host',
            phone: '+678 234 567',
            role: 'host',
            isHost: true,
            verified: true
        });
        console.log('✅ Demo host created: host@vanuatu.com / host123');
    } else {
        hostUser = hostExists;
    }

    const count = await Service.countDocuments();

    if (count === 0) {
        await Service.insertMany([
            {
                name: 'Port Vila Beach Resort',
                description: 'Luxury beachfront accommodation with stunning ocean views',
                category: 'Accommodation',
                price: 150,
                currency: 'VUV',
                duration: 1440,
                capacity: 4,
                location: 'Port Vila, Efate',
                images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '14:00', end: '12:00' },
                isActive: true,
                amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant']
            },
            {
                name: 'Blue Lagoon Island Tour',
                description: 'Full-day tour to the famous Blue Lagoon with snorkeling',
                category: 'Tour',
                price: 85,
                currency: 'VUV',
                duration: 480,
                capacity: 12,
                location: 'Efate Island',
                images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
                availableDays: [1, 2, 3, 4, 5, 6],
                availableHours: { start: '08:00', end: '16:00' },
                isActive: true,
                amenities: ['Lunch', 'Equipment', 'Guide', 'Transport']
            },
            {
                name: 'Scuba Diving Experience',
                description: 'Discover Vanuatu\'s incredible underwater world',
                category: 'Activity',
                price: 120,
                currency: 'VUV',
                duration: 180,
                capacity: 6,
                location: 'Mele Bay',
                images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '07:00', end: '17:00' },
                isActive: true,
                amenities: ['Equipment', 'Instructor', 'Certificate', 'Photos']
            },
            {
                name: 'Traditional Kava Ceremony',
                description: 'Experience authentic Vanuatu culture and kava tradition',
                category: 'Cultural',
                price: 45,
                currency: 'VUV',
                duration: 120,
                capacity: 20,
                location: 'Port Vila Cultural Center',
                images: ['https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800'],
                availableDays: [2, 4, 6],
                availableHours: { start: '18:00', end: '21:00' },
                isActive: true,
                amenities: ['Guide', 'Kava', 'Snacks', 'Cultural Performance']
            },
            {
                name: 'Volcano Tour - Mt Yasur',
                description: 'Visit one of the world\'s most accessible active volcanoes',
                category: 'Adventure',
                price: 200,
                currency: 'VUV',
                duration: 600,
                capacity: 8,
                location: 'Tanna Island',
                images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '13:00', end: '22:00' },
                isActive: true,
                amenities: ['Transport', 'Guide', 'Safety Equipment', 'Dinner']
            },
            {
                name: 'Kayaking & Snorkeling Adventure',
                description: 'Paddle through pristine waters and explore vibrant coral reefs',
                category: 'Activity',
                price: 95,
                currency: 'VUV',
                duration: 240,
                capacity: 10,
                location: 'Erakor Lagoon',
                images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '08:00', end: '16:00' },
                isActive: true,
                amenities: ['Equipment', 'Guide', 'Refreshments', 'Photos']
            },
            {
                name: 'Sunset Cruise',
                description: 'Romantic evening cruise around Port Vila harbour with champagne',
                category: 'Tour',
                price: 110,
                currency: 'VUV',
                duration: 180,
                capacity: 24,
                location: 'Port Vila Harbour',
                images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '17:00', end: '20:00' },
                isActive: true,
                amenities: ['Drinks', 'Snacks', 'Music', 'Captain']
            },
            {
                name: 'Jungle Zip Line Adventure',
                description: 'Fly through the rainforest canopy on 8 thrilling zip lines',
                category: 'Adventure',
                price: 135,
                currency: 'VUV',
                duration: 210,
                capacity: 8,
                location: 'Mele Cascades',
                images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
                availableDays: [1, 2, 3, 4, 5, 6],
                availableHours: { start: '09:00', end: '15:00' },
                isActive: true,
                amenities: ['Safety Equipment', 'Guide', 'Photos', 'Transport']
            },
            {
                name: 'Waterfall Hiking Tour',
                description: 'Trek to hidden waterfalls and swim in natural pools',
                category: 'Adventure',
                price: 75,
                currency: 'VUV',
                duration: 300,
                capacity: 12,
                location: 'Mele Cascades',
                images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '07:00', end: '14:00' },
                isActive: true,
                amenities: ['Guide', 'Lunch', 'Water', 'First Aid']
            },
            {
                name: 'Island Hopping Day Trip',
                description: 'Visit multiple islands, snorkel pristine reefs, beach BBQ lunch',
                category: 'Tour',
                price: 155,
                currency: 'VUV',
                duration: 480,
                capacity: 16,
                location: 'Efate Islands',
                images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
                availableDays: [1, 3, 5, 6],
                availableHours: { start: '08:30', end: '16:30' },
                isActive: true,
                amenities: ['Boat', 'Lunch', 'Snorkel Gear', 'Guide', 'Drinks']
            },
            {
                name: 'Cooking Class - Vanuatu Cuisine',
                description: 'Learn to cook traditional island dishes with a local chef',
                category: 'Cultural',
                price: 65,
                currency: 'VUV',
                duration: 180,
                capacity: 10,
                location: 'Port Vila',
                images: ['https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800'],
                availableDays: [1, 3, 5],
                availableHours: { start: '10:00', end: '13:00' },
                isActive: true,
                amenities: ['Ingredients', 'Recipes', 'Meal', 'Apron']
            },
            {
                name: 'Horseback Riding Beach Tour',
                description: 'Ride along pristine beaches and through coconut plantations',
                category: 'Activity',
                price: 105,
                currency: 'VUV',
                duration: 150,
                capacity: 6,
                location: 'Mele Beach',
                images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
                availableDays: [0, 2, 4, 6],
                availableHours: { start: '08:00', end: '16:00' },
                isActive: true,
                amenities: ['Horse', 'Helmet', 'Guide', 'Photos']
            },
            {
                name: 'Spa & Wellness Package',
                description: 'Full day of pampering with massage, facial, and treatments',
                category: 'Relaxation',
                price: 185,
                currency: 'VUV',
                duration: 240,
                capacity: 4,
                location: 'Port Vila Spa Resort',
                images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '09:00', end: '18:00' },
                isActive: true,
                amenities: ['Massage', 'Facial', 'Lunch', 'Sauna', 'Pool Access']
            },
            {
                name: 'Night Market Food Tour',
                description: 'Explore Port Vila\'s vibrant night market with tastings',
                category: 'Cultural',
                price: 55,
                currency: 'VUV',
                duration: 150,
                capacity: 15,
                location: 'Port Vila Night Market',
                images: ['https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800'],
                availableDays: [2, 4, 5, 6],
                availableHours: { start: '18:00', end: '21:00' },
                isActive: true,
                amenities: ['Guide', 'Tastings', 'Drinks', 'Shopping Tips']
            },
            {
                name: 'Deep Sea Fishing Charter',
                description: 'Full day fishing adventure targeting marlin and tuna',
                category: 'Activity',
                price: 425,
                currency: 'VUV',
                duration: 480,
                capacity: 6,
                location: 'Port Vila Marina',
                images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '06:00', end: '14:00' },
                isActive: true,
                amenities: ['Equipment', 'Bait', 'Captain', 'Lunch', 'Drinks', 'Cleaning']
            }
        ]);
        console.log('✅ Sample Vanuatu services created');
    }

    // Seed properties
    const propCount = await Property.countDocuments();
    if (propCount === 0) {
        try {
            await Property.insertMany([
                {
                    name: 'The Havannah Vanuatu',
                    description: 'An adults-only luxury resort featuring private bungalows with plunge pools, pristine beaches, and world-class diving. Experience ultimate relaxation in this exclusive paradise.',
                    propertyType: 'resort',
                    address: {
                        street: 'Lelepa Island',
                        city: 'Port Vila',
                        state: 'Shefa',
                        country: 'Vanuatu',
                        zipCode: '',
                        coordinates: { lat: -17.6979, lng: 168.3146 }
                    },
                    ownerId: hostUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
                    ],
                    amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Beach Access', 'Water Sports', 'Room Service'],
                    rooms: [
                        {
                            type: 'Waterfront Bungalow',
                            description: 'Spacious bungalow with ocean views and private deck',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 450,
                            currency: 'VUV',
                            available: true,
                            count: 8,
                            amenities: ['Ocean View', 'Private Deck', 'Mini Bar', 'Air Conditioning']
                        },
                        {
                            type: 'Beachfront Villa with Pool',
                            description: 'Luxury villa with private plunge pool',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 650,
                            currency: 'VUV',
                            available: true,
                            count: 6,
                            amenities: ['Beach Access', 'Private Pool', 'Outdoor Shower', 'King Bed']
                        }
                    ],
                    rating: 4.9,
                    reviewCount: 287,
                    checkInTime: '14:00',
                    checkOutTime: '11:00',
                    cancellationPolicy: 'moderate',
                    houseRules: ['Adults only (18+)', 'No smoking', 'No pets'],
                    isActive: true,
                    featured: true
                },
                {
                    name: 'Warwick Le Lagon Resort',
                    description: 'Family-friendly resort with spectacular lagoon views, multiple restaurants, and a wide range of activities for all ages.',
                    propertyType: 'resort',
                    address: {
                        street: 'Erakor Lagoon',
                        city: 'Port Vila',
                        state: 'Shefa',
                        country: 'Vanuatu',
                        coordinates: { lat: -17.7478, lng: 168.3204 }
                    },
                    ownerId: adminUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                        'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800'
                    ],
                    amenities: ['Free WiFi', 'Pool', 'Kids Club', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Water Sports'],
                    rooms: [
                        {
                            type: 'Lagoon View Room',
                            description: 'Comfortable room overlooking the lagoon',
                            maxGuests: 3,
                            beds: 2,
                            bathrooms: 1,
                            pricePerNight: 220,
                            currency: 'VUV',
                            available: true,
                            count: 15,
                            amenities: ['Lagoon View', 'Balcony', 'Air Conditioning', 'TV']
                        },
                        {
                            type: 'Family Suite',
                            description: 'Spacious suite perfect for families',
                            maxGuests: 4,
                            beds: 2,
                            bathrooms: 2,
                            pricePerNight: 340,
                            currency: 'VUV',
                            available: true,
                            count: 8,
                            amenities: ['Separate Living Area', 'Kitchenette', 'Two Bathrooms']
                        }
                    ],
                    rating: 4.6,
                    reviewCount: 412,
                    checkInTime: '15:00',
                    checkOutTime: '11:00',
                    cancellationPolicy: 'moderate',
                    houseRules: ['No smoking in rooms', 'Quiet hours 10PM-7AM'],
                    isActive: true,
                    featured: true
                },
                {
                    name: 'Paradise Cove Resort',
                    description: 'Boutique beachfront resort offering a perfect blend of relaxation and adventure in the heart of Vanuatu.',
                    propertyType: 'resort',
                    address: {
                        street: 'Mele Bay',
                        city: 'Port Vila',
                        state: 'Shefa',
                        country: 'Vanuatu',
                        coordinates: { lat: -17.7124, lng: 168.2856 }
                    },
                    ownerId: hostUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
                        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'
                    ],
                    amenities: ['Free WiFi', 'Beach Access', 'Restaurant', 'Bar', 'Snorkeling', 'Kayaking'],
                    rooms: [
                        {
                            type: 'Garden Bungalow',
                            description: 'Cozy bungalow surrounded by tropical gardens',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 180,
                            currency: 'VUV',
                            available: true,
                            count: 10,
                            amenities: ['Garden View', 'Fan', 'Mini Fridge']
                        },
                        {
                            type: 'Beachfront Bungalow',
                            description: 'Steps from the beach with stunning views',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 260,
                            currency: 'VUV',
                            available: true,
                            count: 6,
                            amenities: ['Beach Access', 'Ocean View', 'Air Conditioning']
                        }
                    ],
                    rating: 4.7,
                    reviewCount: 156,
                    checkInTime: '14:00',
                    checkOutTime: '10:00',
                    cancellationPolicy: 'flexible',
                    houseRules: ['No smoking', 'No parties'],
                    isActive: true,
                    featured: false
                },
                {
                    name: 'Port Vila Waterfront Apartment',
                    description: 'Modern apartment in the heart of Port Vila with spectacular harbor views. Perfect for exploring the city.',
                    propertyType: 'apartment',
                    address: {
                        street: 'Lini Highway',
                        city: 'Port Vila',
                        state: 'Shefa',
                        country: 'Vanuatu',
                        coordinates: { lat: -17.7346, lng: 168.3195 }
                    },
                    ownerId: hostUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
                    ],
                    amenities: ['Free WiFi', 'Kitchen', 'Air Conditioning', 'Parking', 'City View'],
                    rooms: [
                        {
                            type: 'Two Bedroom Apartment',
                            description: 'Fully furnished apartment with modern amenities',
                            maxGuests: 4,
                            beds: 2,
                            bathrooms: 2,
                            pricePerNight: 150,
                            currency: 'VUV',
                            available: true,
                            count: 1,
                            amenities: ['Full Kitchen', 'Washer/Dryer', 'Balcony', 'TV']
                        }
                    ],
                    rating: 4.5,
                    reviewCount: 89,
                    checkInTime: '15:00',
                    checkOutTime: '10:00',
                    cancellationPolicy: 'moderate',
                    houseRules: ['No smoking', 'No pets', 'No parties'],
                    isActive: true,
                    featured: false
                },
                {
                    name: 'Tanna Island Beach Villa',
                    description: 'Exclusive private villa near Mt Yasur volcano. Experience authentic island living with modern comforts.',
                    propertyType: 'villa',
                    address: {
                        street: 'White Grass',
                        city: 'Tanna',
                        state: 'Tafea',
                        country: 'Vanuatu',
                        coordinates: { lat: -19.5247, lng: 169.2433 }
                    },
                    ownerId: adminUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
                    ],
                    amenities: ['Free WiFi', 'Kitchen', 'Beach Access', 'BBQ', 'Volcano Tours'],
                    rooms: [
                        {
                            type: 'Private Villa',
                            description: 'Entire villa with 3 bedrooms and private beach',
                            maxGuests: 6,
                            beds: 3,
                            bathrooms: 2,
                            pricePerNight: 420,
                            currency: 'VUV',
                            available: true,
                            count: 1,
                            amenities: ['Full Kitchen', 'Living Room', 'Outdoor Dining', 'Private Beach']
                        }
                    ],
                    rating: 4.8,
                    reviewCount: 45,
                    checkInTime: '14:00',
                    checkOutTime: '11:00',
                    cancellationPolicy: 'strict',
                    houseRules: ['No smoking indoors', 'Respect local customs'],
                    isActive: true,
                    featured: true
                },
                {
                    name: 'Iririki Island Resort & Spa',
                    description: 'Private island resort just minutes from Port Vila. Luxury rooms, infinity pool, spa, and stunning harbour views.',
                    propertyType: 'resort',
                    address: {
                        street: 'Iririki Island',
                        city: 'Port Vila',
                        state: 'Shefa',
                        country: 'Vanuatu',
                        coordinates: { lat: -17.7456, lng: 168.3189 }
                    },
                    ownerId: hostUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
                    ],
                    amenities: ['Free WiFi', 'Infinity Pool', 'Spa', 'Fine Dining', 'Fitness Center', 'Water Sports', 'Kids Club'],
                    rooms: [
                        {
                            type: 'Deluxe Harbour View',
                            description: 'Spacious room with panoramic harbour views',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 280,
                            currency: 'VUV',
                            available: true,
                            count: 12,
                            amenities: ['Balcony', 'Mini Bar', 'Rain Shower', 'Coffee Machine']
                        },
                        {
                            type: 'Ocean View Suite',
                            description: 'Luxurious suite with living area and ocean views',
                            maxGuests: 4,
                            beds: 2,
                            bathrooms: 2,
                            pricePerNight: 450,
                            currency: 'VUV',
                            available: true,
                            count: 6,
                            amenities: ['Living Room', 'Jacuzzi', 'Butler Service', 'Premium Toiletries']
                        }
                    ],
                    rating: 4.7,
                    reviewCount: 234,
                    checkInTime: '14:00',
                    checkOutTime: '11:00',
                    cancellationPolicy: 'moderate',
                    houseRules: ['No smoking in rooms', 'Resort wear at dining'],
                    isActive: true,
                    featured: true
                },
                {
                    name: 'Coconut Palms Beach Bungalows',
                    description: 'Affordable beachfront bungalows perfect for backpackers and budget travelers. Friendly atmosphere and pristine beach.',
                    propertyType: 'guesthouse',
                    address: {
                        street: 'Erakor Beach',
                        city: 'Port Vila',
                        state: 'Shefa',
                        country: 'Vanuatu',
                        coordinates: { lat: -17.7612, lng: 168.3345 }
                    },
                    ownerId: hostUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
                    ],
                    amenities: ['Free WiFi', 'Beach Access', 'Shared Kitchen', 'BBQ Area', 'Kayaks'],
                    rooms: [
                        {
                            type: 'Beach Bungalow',
                            description: 'Simple beach bungalow with fan',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 85,
                            currency: 'VUV',
                            available: true,
                            count: 8,
                            amenities: ['Fan', 'Mosquito Net', 'Private Porch']
                        },
                        {
                            type: 'Family Bungalow',
                            description: 'Larger bungalow for families',
                            maxGuests: 4,
                            beds: 2,
                            bathrooms: 1,
                            pricePerNight: 135,
                            currency: 'VUV',
                            available: true,
                            count: 4,
                            amenities: ['AC', 'Kitchen', 'Beach View']
                        }
                    ],
                    rating: 4.3,
                    reviewCount: 156,
                    checkInTime: '14:00',
                    checkOutTime: '10:00',
                    cancellationPolicy: 'flexible',
                    houseRules: ['Quiet hours 22:00-07:00', 'Respect other guests'],
                    isActive: true,
                    featured: false
                },
                {
                    name: 'Espiritu Santo Eco Lodge',
                    description: 'Eco-friendly jungle lodge on Santo Island. Perfect base for blue holes, beaches, and diving.',
                    propertyType: 'guesthouse',
                    address: {
                        street: 'Luganville',
                        city: 'Espiritu Santo',
                        state: 'Sanma',
                        country: 'Vanuatu',
                        coordinates: { lat: -15.5167, lng: 167.1667 }
                    },
                    ownerId: hostUser._id,
                    images: [
                        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
                    ],
                    amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Garden', 'Tour Desk', 'Bike Rental'],
                    rooms: [
                        {
                            type: 'Garden Room',
                            description: 'Cozy room surrounded by tropical gardens',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 110,
                            currency: 'VUV',
                            available: true,
                            count: 10,
                            amenities: ['AC', 'Garden View', 'Eco-Friendly Toiletries']
                        },
                        {
                            type: 'Treehouse Suite',
                            description: 'Unique treehouse experience with jungle views',
                            maxGuests: 2,
                            beds: 1,
                            bathrooms: 1,
                            pricePerNight: 165,
                            currency: 'VUV',
                            available: true,
                            count: 3,
                            amenities: ['Private Deck', 'Hammock', 'Binoculars', 'Nature Sounds']
                        }
                    ],
                    rating: 4.6,
                    reviewCount: 98,
                    checkInTime: '14:00',
                    checkOutTime: '11:00',
                    cancellationPolicy: 'moderate',
                    houseRules: ['Respect nature', 'No single-use plastics'],
                    isActive: true,
                    featured: true
                }
            ]);
            console.log('✅ Sample properties created');
        } catch (error) {
            console.log('⚠️ Properties already seeded or validation error (skipping)');
        }
    }

    // Seed flights
    const Flight = (await import('./models/Flight')).default;
    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        await Flight.insertMany([
            {
                flightNumber: 'NF001',
                airline: {
                    code: 'NF',
                    name: 'Air Vanuatu',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Air_Vanuatu_Logo.svg/200px-Air_Vanuatu_Logo.svg.png'
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu'
                    },
                    terminal: '1',
                    dateTime: tomorrow
                },
                arrival: {
                    airport: {
                        code: 'SYD',
                        name: 'Sydney Kingsford Smith Airport',
                        city: 'Sydney',
                        country: 'Australia'
                    },
                    terminal: '1',
                    dateTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000)
                },
                duration: 240,
                aircraft: {
                    type: 'Boeing',
                    model: '737-800'
                },
                classes: {
                    economy: {
                        available: 120,
                        price: 45000,
                        baggage: { cabin: '7kg', checked: '23kg' },
                        amenities: ['In-flight meal', 'Entertainment', 'WiFi']
                    },
                    business: {
                        available: 20,
                        price: 95000,
                        baggage: { cabin: '14kg', checked: '32kg' },
                        amenities: ['Lounge access', 'Priority boarding', 'Flat bed', 'Premium meals', 'WiFi']
                    }
                },
                stops: 0,
                status: 'scheduled',
                isInternational: true,
                currency: 'VUV',
                isActive: true
            },
            {
                flightNumber: 'NF102',
                airline: {
                    code: 'NF',
                    name: 'Air Vanuatu',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Air_Vanuatu_Logo.svg/200px-Air_Vanuatu_Logo.svg.png'
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu'
                    },
                    dateTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
                },
                arrival: {
                    airport: {
                        code: 'NOU',
                        name: 'La Tontouta International Airport',
                        city: 'Noumea',
                        country: 'New Caledonia'
                    },
                    dateTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000)
                },
                duration: 90,
                aircraft: {
                    type: 'ATR',
                    model: '72-600'
                },
                classes: {
                    economy: {
                        available: 68,
                        price: 25000,
                        baggage: { cabin: '7kg', checked: '20kg' },
                        amenities: ['Snacks', 'Beverages']
                    }
                },
                stops: 0,
                status: 'scheduled',
                isInternational: true,
                currency: 'VUV',
                isActive: true
            },
            {
                flightNumber: 'QF142',
                airline: {
                    code: 'QF',
                    name: 'Qantas',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Qantas_logo_2016.svg/200px-Qantas_logo_2016.svg.png'
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu'
                    },
                    dateTime: new Date(tomorrow.getTime() + 48 * 60 * 60 * 1000)
                },
                arrival: {
                    airport: {
                        code: 'BNE',
                        name: 'Brisbane Airport',
                        city: 'Brisbane',
                        country: 'Australia'
                    },
                    dateTime: new Date(tomorrow.getTime() + 48 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000)
                },
                duration: 210,
                aircraft: {
                    type: 'Boeing',
                    model: '737'
                },
                classes: {
                    economy: {
                        available: 138,
                        price: 42000,
                        baggage: { cabin: '7kg', checked: '23kg' },
                        amenities: ['Meal', 'Entertainment', 'WiFi']
                    },
                    business: {
                        available: 12,
                        price: 88000,
                        baggage: { cabin: '14kg', checked: '32kg' },
                        amenities: ['Lounge', 'Priority', 'Lie-flat seats', 'Premium dining']
                    }
                },
                stops: 0,
                status: 'scheduled',
                isInternational: true,
                currency: 'VUV',
                isActive: true
            },
            {
                flightNumber: 'NZ822',
                airline: {
                    code: 'NZ',
                    name: 'Air New Zealand',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/Air_New_Zealand_Logo.svg/200px-Air_New_Zealand_Logo.svg.png'
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu'
                    },
                    dateTime: new Date(tomorrow.getTime() + 72 * 60 * 60 * 1000)
                },
                arrival: {
                    airport: {
                        code: 'AKL',
                        name: 'Auckland Airport',
                        city: 'Auckland',
                        country: 'New Zealand'
                    },
                    dateTime: new Date(tomorrow.getTime() + 72 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
                },
                duration: 180,
                aircraft: {
                    type: 'Airbus',
                    model: 'A320'
                },
                classes: {
                    economy: {
                        available: 150,
                        price: 48000,
                        baggage: { cabin: '7kg', checked: '23kg' },
                        amenities: ['Meal', 'Drinks', 'Entertainment']
                    },
                    business: {
                        available: 18,
                        price: 102000,
                        baggage: { cabin: '14kg', checked: '32kg' },
                        amenities: ['Lounge', 'Spacious seats', 'Premium meals', 'Priority boarding']
                    }
                },
                stops: 0,
                status: 'scheduled',
                isInternational: true,
                currency: 'VUV',
                isActive: true
            },
            {
                flightNumber: 'FJ950',
                airline: {
                    code: 'FJ',
                    name: 'Fiji Airways',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Fiji_Airways_logo.svg/200px-Fiji_Airways_logo.svg.png'
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu'
                    },
                    dateTime: new Date(tomorrow.getTime() + 96 * 60 * 60 * 1000)
                },
                arrival: {
                    airport: {
                        code: 'NAN',
                        name: 'Nadi International Airport',
                        city: 'Nadi',
                        country: 'Fiji'
                    },
                    dateTime: new Date(tomorrow.getTime() + 96 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
                },
                duration: 120,
                aircraft: {
                    type: 'Airbus',
                    model: 'A330'
                },
                classes: {
                    economy: {
                        available: 200,
                        price: 38000,
                        baggage: { cabin: '7kg', checked: '23kg' },
                        amenities: ['Meal', 'Entertainment', 'Drinks']
                    },
                    business: {
                        available: 24,
                        price: 85000,
                        baggage: { cabin: '14kg', checked: '32kg' },
                        amenities: ['Lounge', 'Flat bed', 'Premium dining', 'Priority service']
                    }
                },
                stops: 0,
                status: 'scheduled',
                isInternational: true,
                currency: 'VUV',
                isActive: true
            }
        ]);
        console.log('✅ Sample flights created');
    }

    // Seed car rentals
    const CarRental = (await import('./models/CarRental')).default;
    const carCount = await CarRental.countDocuments();
    if (carCount === 0) {
        await CarRental.insertMany([
            {
                company: {
                    name: 'Vanuatu Car Hire',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%234F46E5"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold"%3EVCH%3C/text%3E%3C/svg%3E',
                    rating: 4.5,
                    reviewCount: 150
                },
                vehicle: {
                    make: 'Toyota',
                    model: 'RAV4',
                    year: 2023,
                    category: 'suv',
                    transmission: 'automatic',
                    fuelType: 'petrol',
                    seats: 5,
                    doors: 4,
                    luggage: 3,
                    airConditioning: true
                },
                images: [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
                ],
                location: {
                    pickupLocations: [{
                        name: 'Bauerfield Airport',
                        address: 'Airport Terminal, Port Vila',
                        type: 'airport',
                        coordinates: { type: 'Point', coordinates: [168.3146, -17.6979] },
                        openingHours: '24/7'
                    }],
                    dropoffLocations: [{
                        name: 'Bauerfield Airport',
                        address: 'Airport Terminal, Port Vila',
                        type: 'airport',
                        coordinates: { type: 'Point', coordinates: [168.3146, -17.6979] },
                        openingHours: '24/7'
                    }]
                },
                pricing: {
                    dailyRate: 8500,
                    weeklyRate: 52000,
                    currency: 'VUV',
                    deposit: 50000,
                    excessReduction: 5000
                },
                features: ['GPS', 'Bluetooth', 'USB', 'Cruise Control', 'Backup Camera'],
                fuelPolicy: 'full-to-full',
                mileage: {
                    unlimited: true
                },
                insurance: {
                    basic: {
                        included: true,
                        coverage: 'Third Party',
                        excess: 100000
                    },
                    premium: {
                        price: 2000,
                        coverage: 'Comprehensive',
                        excess: 20000
                    }
                },
                requirements: {
                    minAge: 21,
                    drivingLicenseYears: 2,
                    internationalLicense: true
                },
                available: 5,
                rating: 4.5,
                reviewCount: 89,
                isActive: true
            },
            {
                company: {
                    name: 'Island Rentals',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%2310B981"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold"%3EIR%3C/text%3E%3C/svg%3E',
                    rating: 4.3,
                    reviewCount: 120
                },
                vehicle: {
                    make: 'Hyundai',
                    model: 'i20',
                    year: 2022,
                    category: 'compact',
                    transmission: 'manual',
                    fuelType: 'petrol',
                    seats: 5,
                    doors: 4,
                    luggage: 2,
                    airConditioning: true
                },
                images: [
                    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
                ],
                location: {
                    pickupLocations: [{
                        name: 'Port Vila City Center',
                        address: 'Lini Highway, Port Vila',
                        type: 'city',
                        coordinates: { type: 'Point', coordinates: [168.3190, -17.7334] },
                        openingHours: '8:00-17:00'
                    }],
                    dropoffLocations: [{
                        name: 'Port Vila City Center',
                        address: 'Lini Highway, Port Vila',
                        type: 'city',
                        coordinates: { type: 'Point', coordinates: [168.3190, -17.7334] },
                        openingHours: '8:00-17:00'
                    }]
                },
                pricing: {
                    dailyRate: 5500,
                    weeklyRate: 32000,
                    currency: 'VUV',
                    deposit: 30000
                },
                features: ['USB', 'Air Conditioning'],
                fuelPolicy: 'full-to-full',
                mileage: {
                    unlimited: false,
                    kmPerDay: 150,
                    extraKmCharge: 50
                },
                insurance: {
                    basic: {
                        included: true,
                        coverage: 'Third Party',
                        excess: 80000
                    }
                },
                requirements: {
                    minAge: 21,
                    drivingLicenseYears: 1,
                    internationalLicense: true
                },
                available: 8,
                rating: 4.3,
                reviewCount: 67,
                isActive: true
            },
            {
                company: {
                    name: 'Island 4WD Rentals',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%23F59E0B"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="11" fill="white" text-anchor="middle" font-weight="bold"%3EI4WD%3C/text%3E%3C/svg%3E',
                    rating: 4.7,
                    reviewCount: 189
                },
                vehicle: {
                    make: 'Mitsubishi',
                    model: 'Pajero',
                    year: 2022,
                    category: '4x4',
                    transmission: 'automatic',
                    fuelType: 'diesel',
                    seats: 7,
                    doors: 4,
                    luggage: 4,
                    airConditioning: true
                },
                images: [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
                ],
                location: {
                    pickupLocations: [{
                        name: 'Port Vila Office',
                        address: 'Main Street, Port Vila',
                        type: 'city',
                        coordinates: { type: 'Point', coordinates: [168.3210, -17.7340] },
                        openingHours: '08:00-18:00'
                    }],
                    dropoffLocations: [{
                        name: 'Port Vila Office',
                        address: 'Main Street, Port Vila',
                        type: 'city',
                        coordinates: { type: 'Point', coordinates: [168.3210, -17.7340] },
                        openingHours: '08:00-18:00'
                    }]
                },
                pricing: {
                    dailyRate: 12500,
                    weeklyRate: 78000,
                    monthlyRate: 280000,
                    currency: 'VUV',
                    deposit: 75000
                },
                features: ['GPS', '4WD', 'Roof Rack', 'Snorkel', 'Off-road Tires'],
                fuelPolicy: 'full-to-full',
                mileage: {
                    unlimited: true
                },
                insurance: {
                    basic: {
                        included: true,
                        coverage: 'Third Party',
                        excess: 120000
                    }
                },
                requirements: {
                    minAge: 25,
                    drivingLicenseYears: 3,
                    internationalLicense: true
                },
                available: 5,
                rating: 4.7,
                reviewCount: 189,
                isActive: true
            },
            {
                company: {
                    name: 'Budget Vanuatu',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%23EF4444"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" font-weight="bold"%3EBudget%3C/text%3E%3C/svg%3E',
                    rating: 4.2,
                    reviewCount: 312
                },
                vehicle: {
                    make: 'Suzuki',
                    model: 'Swift',
                    year: 2023,
                    category: 'compact',
                    transmission: 'manual',
                    fuelType: 'petrol',
                    seats: 5,
                    doors: 4,
                    luggage: 2,
                    airConditioning: true
                },
                images: [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
                ],
                location: {
                    pickupLocations: [{
                        name: 'Airport Counter',
                        address: 'Bauerfield Airport',
                        type: 'airport',
                        coordinates: { type: 'Point', coordinates: [168.3146, -17.6979] },
                        openingHours: '06:00-22:00'
                    }],
                    dropoffLocations: [{
                        name: 'Airport Counter',
                        address: 'Bauerfield Airport',
                        type: 'airport',
                        coordinates: { type: 'Point', coordinates: [168.3146, -17.6979] },
                        openingHours: '06:00-22:00'
                    }]
                },
                pricing: {
                    dailyRate: 4200,
                    weeklyRate: 24500,
                    monthlyRate: 88000,
                    currency: 'VUV',
                    deposit: 25000
                },
                features: ['USB', 'AC', 'Bluetooth'],
                fuelPolicy: 'full-to-full',
                mileage: {
                    unlimited: false,
                    kmPerDay: 200,
                    extraKmCharge: 40
                },
                insurance: {
                    basic: {
                        included: true,
                        coverage: 'Third Party',
                        excess: 70000
                    }
                },
                requirements: {
                    minAge: 21,
                    drivingLicenseYears: 1,
                    internationalLicense: true
                },
                available: 15,
                rating: 4.2,
                reviewCount: 312,
                isActive: true
            },
            {
                company: {
                    name: 'Vanuatu Luxury Car Hire',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%23000000"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="13" fill="gold" text-anchor="middle" font-weight="bold"%3EVLC%3C/text%3E%3C/svg%3E',
                    rating: 4.9,
                    reviewCount: 78
                },
                vehicle: {
                    make: 'Mercedes',
                    model: 'GLE',
                    year: 2024,
                    category: 'luxury',
                    transmission: 'automatic',
                    fuelType: 'petrol',
                    seats: 5,
                    doors: 4,
                    luggage: 3,
                    airConditioning: true
                },
                images: [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
                ],
                location: {
                    pickupLocations: [{
                        name: 'Concierge Delivery',
                        address: 'Hotel delivery available',
                        type: 'hotel',
                        coordinates: { type: 'Point', coordinates: [168.3210, -17.7340] },
                        openingHours: '24/7'
                    }],
                    dropoffLocations: [{
                        name: 'Concierge Pickup',
                        address: 'Hotel pickup available',
                        type: 'hotel',
                        coordinates: { type: 'Point', coordinates: [168.3210, -17.7340] },
                        openingHours: '24/7'
                    }]
                },
                pricing: {
                    dailyRate: 28000,
                    weeklyRate: 180000,
                    monthlyRate: 650000,
                    currency: 'VUV',
                    deposit: 150000
                },
                features: ['Premium Sound', 'Leather Seats', 'Panoramic Roof', 'Advanced GPS', 'Heated Seats'],
                fuelPolicy: 'full-to-full',
                mileage: {
                    unlimited: true
                },
                insurance: {
                    basic: {
                        included: true,
                        coverage: 'Comprehensive',
                        excess: 50000
                    }
                },
                requirements: {
                    minAge: 30,
                    drivingLicenseYears: 5,
                    internationalLicense: true
                },
                available: 2,
                rating: 4.9,
                reviewCount: 78,
                isActive: true
            }
        ]);
        console.log('✅ Sample car rentals created');
    }

    // Seed transfers
    const Transfer = (await import('./models/Transfer')).default;
    const transferCount = await Transfer.countDocuments();
    if (transferCount === 0) {
        await Transfer.insertMany([
            {
                name: 'Airport to Port Vila Hotels',
                description: 'Comfortable and reliable airport transfer service to all Port Vila hotels',
                provider: {
                    name: 'Vanuatu Transfers',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%233B82F6"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold"%3EVT%3C/text%3E%3C/svg%3E',
                    rating: 4.7,
                    reviewCount: 320
                },
                type: 'airport',
                route: {
                    from: {
                        name: 'Bauerfield International Airport',
                        address: 'Airport Road, Port Vila',
                        type: 'Airport',
                        coordinates: { type: 'Point', coordinates: [168.3146, -17.6979] }
                    },
                    to: {
                        name: 'Port Vila Hotels',
                        address: 'Various hotels in Port Vila',
                        type: 'Hotel',
                        coordinates: { type: 'Point', coordinates: [168.3190, -17.7334] }
                    },
                    distance: 6,
                    duration: 15
                },
                vehicleOptions: [
                    {
                        type: 'sedan',
                        capacity: 3,
                        luggage: 3,
                        price: 2500,
                        features: ['Air Conditioning', 'WiFi', 'Bottled Water'],
                        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
                        available: 10
                    },
                    {
                        type: 'van',
                        capacity: 7,
                        luggage: 7,
                        price: 4500,
                        features: ['Air Conditioning', 'WiFi', 'Bottled Water', 'Extra Space'],
                        image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800',
                        available: 5
                    }
                ],
                schedule: {
                    availability: '24/7'
                },
                pricing: {
                    basePrice: 2500,
                    currency: 'VUV',
                    waitingTimeFee: 1000
                },
                features: ['Meet & Greet', 'Flight Tracking', 'Child Seats Available', 'English Speaking Driver'],
                cancellationPolicy: {
                    freeCancellation: true,
                    deadline: 24,
                    refundPercentage: 100
                },
                meetAndGreet: true,
                flightTracking: true,
                childSeatAvailable: true,
                wheelchairAccessible: false,
                rating: 4.7,
                reviewCount: 320,
                isActive: true
            },
            {
                name: 'Port Vila City Tour Transfer',
                description: 'Private transfer with guided city tour of Port Vila attractions',
                provider: {
                    name: 'Island Tours & Transfers',
                    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"%3E%3Crect width="100" height="40" fill="%2306B6D4"/%3E%3Ctext x="50" y="22" font-family="Arial, sans-serif" font-size="13" fill="white" text-anchor="middle" font-weight="bold"%3EITT%3C/text%3E%3C/svg%3E',
                    rating: 4.6,
                    reviewCount: 180
                },
                type: 'tour',
                route: {
                    from: {
                        name: 'Port Vila Hotels',
                        address: 'Various hotels',
                        type: 'Hotel',
                        coordinates: { type: 'Point', coordinates: [168.3190, -17.7334] }
                    },
                    to: {
                        name: 'Port Vila Attractions',
                        address: 'City tour route',
                        type: 'Multiple locations',
                        coordinates: { type: 'Point', coordinates: [168.3200, -17.7400] }
                    },
                    distance: 25,
                    duration: 240
                },
                vehicleOptions: [
                    {
                        type: 'minibus',
                        capacity: 12,
                        luggage: 12,
                        price: 15000,
                        features: ['Air Conditioning', 'Tour Guide', 'Refreshments', 'WiFi'],
                        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
                        available: 3
                    }
                ],
                schedule: {
                    availability: 'scheduled',
                    operatingHours: {
                        start: '08:00',
                        end: '17:00'
                    }
                },
                pricing: {
                    basePrice: 15000,
                    currency: 'VUV'
                },
                features: ['Professional Guide', 'Multiple Stops', 'Photo Opportunities', 'Cultural Insights'],
                cancellationPolicy: {
                    freeCancellation: true,
                    deadline: 48,
                    refundPercentage: 100
                },
                meetAndGreet: true,
                flightTracking: false,
                childSeatAvailable: true,
                wheelchairAccessible: true,
                rating: 4.6,
                reviewCount: 180,
                isActive: true
            }
        ]);
        console.log('✅ Sample transfers created');
    }

    // Seed travel packages
    const TravelPackage = (await import('./models/TravelPackage')).default;
    const packageCount = await TravelPackage.countDocuments();
    if (packageCount === 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 30);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        await TravelPackage.insertMany([
            {
                name: 'Vanuatu Paradise Escape - 7 Days',
                description: 'Experience the best of Vanuatu with this all-inclusive package featuring luxury accommodation, island tours, water activities, and authentic cultural experiences.',
                images: [
                    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
                ],
                destination: 'Port Vila, Vanuatu',
                destinationCoordinates: {
                    lat: -17.7334,
                    lng: 168.3273
                },
                duration: {
                    days: 7,
                    nights: 6
                },
                includes: {
                    flights: false,
                    accommodation: true,
                    transfers: true,
                    tours: true,
                    meals: 'half-board',
                    carRental: false,
                    insurance: false
                },
                itinerary: [
                    {
                        day: 1,
                        title: 'Arrival & Welcome',
                        description: 'Arrive at Bauerfield Airport, meet your guide, and transfer to your beachfront resort. Enjoy a welcome cocktail and sunset dinner.',
                        activities: ['Airport transfer', 'Hotel check-in', 'Welcome dinner'],
                        meals: ['Dinner'],
                        accommodation: 'The Havannah Vanuatu - Waterfront Bungalow'
                    },
                    {
                        day: 2,
                        title: 'Blue Lagoon Adventure',
                        description: 'Full-day tour to the stunning Blue Lagoon. Swim, snorkel, and relax in crystal-clear waters.',
                        activities: ['Blue Lagoon tour', 'Snorkeling', 'Beach barbecue lunch'],
                        meals: ['Breakfast', 'Lunch'],
                        accommodation: 'The Havannah Vanuatu'
                    },
                    {
                        day: 3,
                        title: 'Scuba Diving Experience',
                        description: 'Discover Vanuatu\'s incredible underwater world with a guided diving session.',
                        activities: ['Scuba diving', 'Free afternoon', 'Spa treatment (optional)'],
                        meals: ['Breakfast'],
                        accommodation: 'The Havannah Vanuatu'
                    },
                    {
                        day: 4,
                        title: 'Cultural Immersion',
                        description: 'Experience traditional Vanuatu culture with village visit and kava ceremony.',
                        activities: ['Village tour', 'Traditional lunch', 'Kava ceremony', 'Cultural performance'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'The Havannah Vanuatu'
                    },
                    {
                        day: 5,
                        title: 'Island Hopping',
                        description: 'Visit nearby islands, explore hidden beaches, and enjoy water sports.',
                        activities: ['Island hopping', 'Kayaking', 'Beach picnic'],
                        meals: ['Breakfast', 'Lunch'],
                        accommodation: 'The Havannah Vanuatu'
                    },
                    {
                        day: 6,
                        title: 'Leisure Day',
                        description: 'Free day to enjoy resort amenities or book optional activities.',
                        activities: ['Leisure time', 'Optional activities', 'Farewell dinner'],
                        meals: ['Breakfast', 'Dinner'],
                        accommodation: 'The Havannah Vanuatu'
                    },
                    {
                        day: 7,
                        title: 'Departure',
                        description: 'Transfer to airport for your departure flight.',
                        activities: ['Check-out', 'Airport transfer'],
                        meals: ['Breakfast'],
                        accommodation: ''
                    }
                ],
                pricing: {
                    basePrice: 185000,
                    currency: 'VUV',
                    priceIncludes: [
                        '6 nights luxury accommodation',
                        'Daily breakfast and 3 dinners',
                        'All listed tours and activities',
                        'Airport transfers',
                        'English-speaking guide',
                        'Entrance fees'
                    ],
                    priceExcludes: [
                        'International flights',
                        'Travel insurance',
                        'Optional activities',
                        'Personal expenses',
                        'Spa treatments'
                    ],
                    discountPercentage: 10
                },
                availability: {
                    startDate: startDate,
                    endDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
                    maxParticipants: 20,
                    minParticipants: 2,
                    currentBookings: 0
                },
                category: 'beach',
                difficulty: 'easy',
                highlights: [
                    'Luxury beachfront accommodation',
                    'Blue Lagoon snorkeling',
                    'Scuba diving experience',
                    'Traditional kava ceremony',
                    'Island hopping adventure',
                    'Cultural village visit',
                    'Half-board meals included'
                ],
                rating: 4.8,
                reviewCount: 45,
                isActive: true,
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Adventure Seeker Package - 5 Days',
                description: 'Action-packed adventure package featuring volcano trekking, zip-lining, diving, and jungle exploration.',
                images: [
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
                ],
                destination: 'Tanna & Efate, Vanuatu',
                destinationCoordinates: {
                    lat: -19.5078,
                    lng: 169.4417
                },
                duration: {
                    days: 5,
                    nights: 4
                },
                includes: {
                    flights: true,
                    accommodation: true,
                    transfers: true,
                    tours: true,
                    meals: 'breakfast',
                    carRental: false,
                    insurance: false
                },
                itinerary: [
                    {
                        day: 1,
                        title: 'Arrival & City Exploration',
                        description: 'Arrive in Port Vila, hotel check-in, and evening city tour.',
                        activities: ['Airport transfer', 'City tour', 'Dinner'],
                        meals: ['Dinner'],
                        accommodation: 'Port Vila Hotel'
                    },
                    {
                        day: 2,
                        title: 'Flight to Tanna - Volcano Trek',
                        description: 'Fly to Tanna Island and trek to Mt. Yasur volcano at sunset.',
                        activities: ['Flight to Tanna', 'Mt. Yasur volcano tour'],
                        meals: ['Breakfast', 'Dinner'],
                        accommodation: 'Tanna Lodge'
                    },
                    {
                        day: 3,
                        title: 'Return to Efate - Diving',
                        description: 'Morning flight back, afternoon scuba diving session.',
                        activities: ['Flight to Efate', 'Scuba diving', 'Beach time'],
                        meals: ['Breakfast'],
                        accommodation: 'Port Vila Hotel'
                    },
                    {
                        day: 4,
                        title: 'Jungle & Waterfall Adventure',
                        description: 'Trek through jungle, visit waterfalls, and zip-line experience.',
                        activities: ['Jungle trekking', 'Waterfall swim', 'Zip-lining'],
                        meals: ['Breakfast', 'Lunch'],
                        accommodation: 'Port Vila Hotel'
                    },
                    {
                        day: 5,
                        title: 'Departure',
                        description: 'Free morning, transfer to airport.',
                        activities: ['Free time', 'Airport transfer'],
                        meals: ['Breakfast'],
                        accommodation: ''
                    }
                ],
                pricing: {
                    basePrice: 125000,
                    currency: 'VUV',
                    priceIncludes: [
                        '4 nights accommodation',
                        'Domestic flights',
                        'Daily breakfast',
                        'All adventure activities',
                        'All transfers',
                        'Professional guides',
                        'Safety equipment'
                    ],
                    priceExcludes: [
                        'International flights',
                        'Lunches and dinners (except listed)',
                        'Travel insurance',
                        'Personal expenses'
                    ]
                },
                availability: {
                    startDate: startDate,
                    endDate: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000),
                    maxParticipants: 12,
                    minParticipants: 2,
                    currentBookings: 0
                },
                category: 'adventure',
                difficulty: 'challenging',
                highlights: [
                    'Mt. Yasur active volcano',
                    'Scuba diving',
                    'Jungle trekking',
                    'Waterfall exploration',
                    'Zip-line adventure',
                    'Domestic flights included'
                ],
                rating: 4.9,
                reviewCount: 32,
                isActive: true,
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Cultural Discovery - 6 Days',
                description: 'Immerse yourself in authentic Vanuatu culture with village visits, traditional ceremonies, and local experiences.',
                images: [
                    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
                ],
                destination: 'Port Vila & Tanna',
                destinationCoordinates: {
                    lat: -17.7334,
                    lng: 168.3273
                },
                duration: {
                    days: 6,
                    nights: 5
                },
                includes: {
                    flights: true,
                    accommodation: true,
                    transfers: true,
                    tours: true,
                    meals: 'half-board',
                    carRental: false,
                    insurance: false
                },
                itinerary: [
                    {
                        day: 1,
                        title: 'Welcome to Vanuatu',
                        description: 'Arrival and traditional welcome ceremony',
                        activities: ['Airport transfer', 'Traditional welcome', 'Cultural briefing'],
                        meals: ['Dinner'],
                        accommodation: 'Port Vila Hotel'
                    },
                    {
                        day: 2,
                        title: 'Village Life Experience',
                        description: 'Visit local villages and participate in daily activities',
                        activities: ['Village tour', 'Traditional crafts', 'Cooking demonstration', 'Kava ceremony'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Village Guesthouse'
                    },
                    {
                        day: 3,
                        title: 'Island Markets & Traditional Dance',
                        description: 'Explore local markets and evening cultural performance',
                        activities: ['Market tour', 'Handicraft shopping', 'Traditional dance show'],
                        meals: ['Breakfast', 'Dinner'],
                        accommodation: 'Port Vila Hotel'
                    },
                    {
                        day: 4,
                        title: 'Flight to Tanna',
                        description: 'Fly to Tanna Island, visit traditional villages',
                        activities: ['Flight', 'Village visits', 'Custom ceremonies'],
                        meals: ['Breakfast', 'Dinner'],
                        accommodation: 'Tanna Lodge'
                    },
                    {
                        day: 5,
                        title: 'Mt. Yasur & Traditional Stories',
                        description: 'Volcano tour with local legends and stories',
                        activities: ['Cultural site visits', 'Mt. Yasur tour', 'Traditional storytelling'],
                        meals: ['Breakfast', 'Dinner'],
                        accommodation: 'Tanna Lodge'
                    },
                    {
                        day: 6,
                        title: 'Departure',
                        description: 'Return flight and departure',
                        activities: ['Flight to Port Vila', 'Airport transfer'],
                        meals: ['Breakfast'],
                        accommodation: ''
                    }
                ],
                pricing: {
                    basePrice: 98000,
                    currency: 'VUV',
                    priceIncludes: [
                        '5 nights accommodation',
                        'Domestic flights',
                        'All meals as listed',
                        'Cultural activities',
                        'Village visits',
                        'Traditional ceremonies',
                        'English-speaking cultural guide'
                    ],
                    priceExcludes: [
                        'International flights',
                        'Travel insurance',
                        'Personal expenses',
                        'Additional meals'
                    ],
                    discountPercentage: 15
                },
                availability: {
                    startDate: startDate,
                    endDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
                    maxParticipants: 15,
                    minParticipants: 4,
                    currentBookings: 0
                },
                category: 'cultural',
                difficulty: 'easy',
                highlights: [
                    'Authentic village experiences',
                    'Traditional kava ceremony',
                    'Custom village visits',
                    'Local craft workshops',
                    'Mt. Yasur with cultural context',
                    'Traditional dance performances'
                ],
                rating: 4.8,
                reviewCount: 67,
                isActive: true,
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Honeymoon Paradise - 8 Days',
                description: 'Romantic luxury getaway with private dinners, spa treatments, and exclusive experiences for couples.',
                images: [
                    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
                ],
                destination: 'Port Vila Private Islands',
                destinationCoordinates: {
                    lat: -17.7456,
                    lng: 168.3189
                },
                duration: {
                    days: 8,
                    nights: 7
                },
                includes: {
                    flights: false,
                    accommodation: true,
                    transfers: true,
                    tours: true,
                    meals: 'full-board',
                    carRental: false,
                    insurance: false
                },
                itinerary: [
                    {
                        day: 1,
                        title: 'Romantic Arrival',
                        description: 'VIP airport transfer to private resort, champagne welcome',
                        activities: ['Private transfer', 'Welcome champagne', 'Couples massage'],
                        meals: ['Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 2,
                        title: 'Beach & Spa Day',
                        description: 'Relax on private beach, couples spa treatments',
                        activities: ['Private beach', 'Spa package', 'Sunset cocktails'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 3,
                        title: 'Private Island Picnic',
                        description: 'Exclusive boat trip to secluded island',
                        activities: ['Private boat', 'Island picnic', 'Snorkeling'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 4,
                        title: 'Romantic Cruise',
                        description: 'Sunset sailing with champagne dinner',
                        activities: ['Leisure morning', 'Sunset cruise', 'Private dinner on boat'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 5,
                        title: 'Underwater Adventure',
                        description: 'Private diving or snorkeling experience',
                        activities: ['Private diving session', 'Beach time', 'Couples photography'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 6,
                        title: 'Cultural Romance',
                        description: 'Private cultural tour and traditional feast',
                        activities: ['Village visit', 'Traditional ceremony', 'Private feast'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 7,
                        title: 'Leisure & Romance',
                        description: 'Free day for resort activities or relaxation',
                        activities: ['Free time', 'Optional activities', 'Beach dinner'],
                        meals: ['Breakfast', 'Lunch', 'Dinner'],
                        accommodation: 'Private Island Resort'
                    },
                    {
                        day: 8,
                        title: 'Farewell',
                        description: 'Private transfer to airport',
                        activities: ['Breakfast in bed', 'Airport transfer'],
                        meals: ['Breakfast'],
                        accommodation: ''
                    }
                ],
                pricing: {
                    basePrice: 295000,
                    currency: 'VUV',
                    priceIncludes: [
                        '7 nights luxury accommodation',
                        'All meals and drinks',
                        'Private airport transfers',
                        'Couples spa package',
                        'Private boat trips',
                        'Sunset cruise',
                        'Photography session',
                        'Room upgrades and decorations'
                    ],
                    priceExcludes: [
                        'International flights',
                        'Travel insurance',
                        'Additional spa treatments',
                        'Personal expenses'
                    ],
                    discountPercentage: 20
                },
                availability: {
                    startDate: startDate,
                    endDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
                    maxParticipants: 2,
                    minParticipants: 2,
                    currentBookings: 0
                },
                category: 'honeymoon',
                difficulty: 'easy',
                highlights: [
                    'Private island resort',
                    'Couples spa treatments',
                    'Romantic dinners',
                    'Private beach access',
                    'Sunset cruises',
                    'Professional photography',
                    'VIP service throughout'
                ],
                rating: 5.0,
                reviewCount: 89,
                isActive: true,
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Family Fun Package - 7 Days',
                description: 'Perfect family vacation with activities for all ages, kids club, and family-friendly accommodations.',
                images: [
                    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
                ],
                destination: 'Port Vila & Efate',
                destinationCoordinates: {
                    lat: -17.7334,
                    lng: 168.3273
                },
                duration: {
                    days: 7,
                    nights: 6
                },
                includes: {
                    flights: false,
                    accommodation: true,
                    transfers: true,
                    tours: true,
                    meals: 'breakfast',
                    carRental: false,
                    insurance: false
                },
                itinerary: [
                    {
                        day: 1,
                        title: 'Family Arrival',
                        description: 'Check-in to family resort, kids club introduction',
                        activities: ['Airport transfer', 'Resort orientation', 'Pool time'],
                        meals: ['Dinner'],
                        accommodation: 'Family Resort'
                    },
                    {
                        day: 2,
                        title: 'Blue Lagoon Adventure',
                        description: 'Family-friendly tour to Blue Lagoon',
                        activities: ['Blue Lagoon tour', 'Swimming', 'Rope swings'],
                        meals: ['Breakfast', 'Lunch'],
                        accommodation: 'Family Resort'
                    },
                    {
                        day: 3,
                        title: 'Aquarium & Beach',
                        description: 'Visit aquarium and relax on beach',
                        activities: ['Aquarium visit', 'Beach games', 'Kids activities'],
                        meals: ['Breakfast'],
                        accommodation: 'Family Resort'
                    },
                    {
                        day: 4,
                        title: 'Waterfall Trek',
                        description: 'Easy waterfall hike suitable for children',
                        activities: ['Mele Cascades', 'Swimming', 'Nature walk'],
                        meals: ['Breakfast'],
                        accommodation: 'Family Resort'
                    },
                    {
                        day: 5,
                        title: 'Island Cruise',
                        description: 'Family boat trip with snorkeling',
                        activities: ['Boat cruise', 'Snorkeling', 'Beach picnic'],
                        meals: ['Breakfast', 'Lunch'],
                        accommodation: 'Family Resort'
                    },
                    {
                        day: 6,
                        title: 'Cultural Experience',
                        description: 'Family-friendly cultural activities',
                        activities: ['Village tour', 'Craft workshops', 'Traditional games'],
                        meals: ['Breakfast', 'Lunch'],
                        accommodation: 'Family Resort'
                    },
                    {
                        day: 7,
                        title: 'Departure',
                        description: 'Final breakfast and airport transfer',
                        activities: ['Free morning', 'Airport transfer'],
                        meals: ['Breakfast'],
                        accommodation: ''
                    }
                ],
                pricing: {
                    basePrice: 145000,
                    currency: 'VUV',
                    priceIncludes: [
                        '6 nights family accommodation',
                        'Daily breakfast',
                        'Kids club access',
                        'Family tours',
                        'All transfers',
                        'Equipment for activities'
                    ],
                    priceExcludes: [
                        'International flights',
                        'Most meals',
                        'Travel insurance',
                        'Optional activities'
                    ],
                    discountPercentage: 0
                },
                availability: {
                    startDate: startDate,
                    endDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
                    maxParticipants: 20,
                    minParticipants: 4,
                    currentBookings: 0
                },
                category: 'family',
                difficulty: 'easy',
                highlights: [
                    'Kids club included',
                    'Family-friendly activities',
                    'Safe swimming beaches',
                    'Educational experiences',
                    'Flexible itinerary',
                    'Child-friendly dining'
                ],
                rating: 4.7,
                reviewCount: 124,
                isActive: true,
                isFeatured: false,
                createdBy: adminUser._id
            }
        ]);
        console.log('✅ Sample travel packages created');
    }

    // Seed discount codes
    const Discount = (await import('./models/Discount')).default;
    const discountCount = await Discount.countDocuments();
    if (discountCount === 0) {
        const now = new Date();
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

        await Discount.insertMany([
            {
                code: 'WELCOME10',
                type: 'percentage',
                value: 10,
                description: 'Welcome discount for new customers',
                validFrom: now,
                validUntil: sixMonthsFromNow,
                maxUses: 1000,
                usedCount: 0,
                minPurchaseAmount: 5000,
                applicableCategories: ['all'],
                userRestrictions: {
                    newUsersOnly: true,
                    maxUsesPerUser: 1
                },
                isActive: true
            },
            {
                code: 'VANUATU20',
                type: 'percentage',
                value: 20,
                description: 'Special Vanuatu promotion',
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 500,
                usedCount: 0,
                minPurchaseAmount: 10000,
                applicableCategories: ['accommodation', 'tour'],
                isActive: true
            },
            {
                code: 'SUMMER2025',
                type: 'percentage',
                value: 15,
                description: 'Summer season special offer',
                validFrom: now,
                validUntil: oneMonthFromNow,
                maxUses: 200,
                usedCount: 0,
                minPurchaseAmount: 7500,
                applicableCategories: ['all'],
                userRestrictions: {
                    maxUsesPerUser: 1
                },
                isActive: true
            },
            {
                code: 'FIRSTBOOKING',
                type: 'fixed',
                value: 5000,
                description: 'First booking bonus - 5000 VUV off',
                validFrom: now,
                validUntil: sixMonthsFromNow,
                usedCount: 0,
                minPurchaseAmount: 15000,
                applicableCategories: ['all'],
                userRestrictions: {
                    newUsersOnly: true,
                    maxUsesPerUser: 1
                },
                isActive: true
            },
            {
                code: 'VIP50',
                type: 'fixed',
                value: 50000,
                description: 'VIP customer exclusive discount',
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 50,
                usedCount: 0,
                minPurchaseAmount: 200000,
                applicableCategories: ['all'],
                maxDiscountAmount: 50000,
                isActive: true
            },
            {
                code: 'CARRENTAL10',
                type: 'percentage',
                value: 10,
                description: 'Car rental special discount',
                validFrom: now,
                validUntil: threeMonthsFromNow,
                usedCount: 0,
                minPurchaseAmount: 5000,
                applicableCategories: ['car-rental'],
                userRestrictions: {
                    maxUsesPerUser: 2
                },
                isActive: true
            },
            {
                code: 'ADVENTURE15',
                type: 'percentage',
                value: 15,
                description: 'Adventure tours discount',
                validFrom: now,
                validUntil: sixMonthsFromNow,
                usedCount: 0,
                minPurchaseAmount: 8000,
                applicableCategories: ['tour', 'activity'],
                isActive: true
            },
            {
                code: 'EARLYBIRD',
                type: 'percentage',
                value: 12,
                description: 'Early bird booking discount',
                validFrom: now,
                validUntil: oneMonthFromNow,
                maxUses: 300,
                usedCount: 0,
                minPurchaseAmount: 10000,
                applicableCategories: ['all'],
                userRestrictions: {
                    maxUsesPerUser: 1
                },
                isActive: true
            }
        ]);
        console.log('✅ Sample discount codes created');
    }
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`✅ Vanuatu Travel Hub running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`Real-time server ready on Socket.io`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close().then(() => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
});

export default app;
