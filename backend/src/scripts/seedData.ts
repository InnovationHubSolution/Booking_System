import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Property from '../models/Property';
import Flight from '../models/Flight';
import Service from '../models/Service';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vanuatu-booking';

// Vanuatu coordinates and locations
const vanuatuLocations = [
    { city: 'Port Vila', lat: -17.7334, lng: 168.3273, province: 'Shefa' },
    { city: 'Luganville', lat: -15.5294, lng: 167.1614, province: 'Sanma' },
    { city: 'Norsup', lat: -16.0744, lng: 167.4011, province: 'Malampa' },
    { city: 'Lakatoro', lat: -16.0974, lng: 167.4177, province: 'Malampa' },
    { city: 'Isangel', lat: -19.5500, lng: 169.2667, province: 'Tafea' },
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Property.deleteMany({});
        await Flight.deleteMany({});
        await Service.deleteMany({});

        // Create Users
        console.log('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await User.insertMany([
            {
                email: 'admin@vanuatu.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                phone: '+678-555-0001',
                role: 'admin',
                isHost: false,
                verified: true,
            },
            {
                email: 'host1@vanuatu.com',
                password: hashedPassword,
                firstName: 'John',
                lastName: 'Resort',
                phone: '+678-555-0002',
                role: 'host',
                isHost: true,
                verified: true,
            },
            {
                email: 'host2@vanuatu.com',
                password: hashedPassword,
                firstName: 'Maria',
                lastName: 'Hotels',
                phone: '+678-555-0003',
                role: 'host',
                isHost: true,
                verified: true,
            },
            {
                email: 'customer1@example.com',
                password: hashedPassword,
                firstName: 'Alice',
                lastName: 'Johnson',
                phone: '+61-412-345-678',
                role: 'customer',
                isHost: false,
                verified: true,
            },
            {
                email: 'customer2@example.com',
                password: hashedPassword,
                firstName: 'Bob',
                lastName: 'Smith',
                phone: '+64-21-456-789',
                role: 'customer',
                isHost: false,
                verified: true,
            },
        ]);

        console.log(`Created ${users.length} users`);

        // Create Properties
        console.log('Creating properties...');
        const properties = await Property.insertMany([
            {
                name: 'The Havannah Vanuatu',
                description: 'An adults-only luxury resort on the edge of a lagoon, featuring private bungalows, a spa, and stunning ocean views. Perfect for romantic getaways and honeymoons.',
                propertyType: 'resort',
                starRating: 5,
                address: {
                    street: 'Port Havannah',
                    city: 'Port Vila',
                    state: 'Shefa',
                    country: 'Vanuatu',
                    zipCode: '',
                    coordinates: {
                        type: 'Point',
                        coordinates: [168.2156, -17.6892], // [longitude, latitude]
                    },
                },
                ownerId: users[1]._id,
                images: [
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                ],
                amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Private Beach', 'Water Sports'],
                rooms: [
                    {
                        type: 'Waterfront Bungalow',
                        description: 'Luxurious bungalow with direct lagoon access',
                        maxGuests: 2,
                        beds: 1,
                        bathrooms: 1,
                        pricePerNight: 450,
                        currency: 'USD',
                        available: true,
                        count: 8,
                        amenities: ['King Bed', 'Ocean View', 'Private Deck', 'Air Conditioning'],
                        mealPlan: 'breakfast',
                        size: 65,
                        bedType: 'King',
                        viewType: 'Ocean view',
                    },
                    {
                        type: 'Premium Villa',
                        description: 'Spacious villa with private pool and ocean views',
                        maxGuests: 4,
                        beds: 2,
                        bathrooms: 2,
                        pricePerNight: 750,
                        currency: 'USD',
                        available: true,
                        count: 4,
                        amenities: ['King Bed', 'Private Pool', 'Ocean View', 'Butler Service'],
                        mealPlan: 'half-board',
                        size: 120,
                        bedType: 'King',
                        viewType: 'Ocean view',
                    },
                ],
                rating: 4.9,
                reviewCount: 287,
                checkInTime: '14:00',
                checkOutTime: '11:00',
                cancellationPolicy: {
                    type: 'moderate',
                    freeCancellationDays: 7,
                    penaltyPercentage: 50,
                },
                houseRules: ['Adults only (18+)', 'No smoking', 'No pets'],
                isActive: true,
                featured: true,
                instantConfirmation: true,
                propertyFeatures: {
                    parking: true,
                    wifi: true,
                    pool: true,
                    gym: true,
                    spa: true,
                    restaurant: true,
                    bar: true,
                    airConditioning: true,
                    petsAllowed: false,
                    smokingAllowed: false,
                    wheelchairAccessible: false,
                    familyFriendly: false,
                    beach: true,
                    kitchen: false,
                    laundry: true,
                    elevator: false,
                    reception24h: true,
                },
                nearbyAttractions: [
                    { name: 'Port Vila Town Center', distance: 17, type: 'shopping' },
                    { name: 'Bauerfield International Airport', distance: 22, type: 'airport' },
                    { name: 'Mele Cascades', distance: 12, type: 'attraction' },
                ],
            },
            {
                name: 'Warwick Le Lagon Resort',
                description: 'A family-friendly beachfront resort with multiple pools, water slides, and activities for all ages. Located on a beautiful lagoon with stunning sunsets.',
                propertyType: 'resort',
                starRating: 4,
                address: {
                    street: 'Erakor Lagoon',
                    city: 'Port Vila',
                    state: 'Shefa',
                    country: 'Vanuatu',
                    zipCode: '',
                    coordinates: {
                        type: 'Point',
                        coordinates: [168.3178, -17.7547],
                    },
                },
                ownerId: users[1]._id,
                images: [
                    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
                    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
                    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
                ],
                amenities: ['Free WiFi', 'Multiple Pools', 'Kids Club', 'Restaurant', 'Beach', 'Water Slides'],
                rooms: [
                    {
                        type: 'Garden View Room',
                        description: 'Comfortable room with garden views',
                        maxGuests: 3,
                        beds: 2,
                        bathrooms: 1,
                        pricePerNight: 180,
                        currency: 'USD',
                        available: true,
                        count: 20,
                        amenities: ['Twin Beds', 'Air Conditioning', 'Balcony'],
                        mealPlan: 'breakfast',
                        size: 35,
                        bedType: 'Twin',
                        viewType: 'Garden view',
                    },
                    {
                        type: 'Lagoon View Suite',
                        description: 'Spacious suite with stunning lagoon views',
                        maxGuests: 4,
                        beds: 2,
                        bathrooms: 1,
                        pricePerNight: 280,
                        currency: 'USD',
                        available: true,
                        count: 15,
                        amenities: ['Queen Bed', 'Sofa Bed', 'Ocean View', 'Living Area'],
                        mealPlan: 'breakfast',
                        size: 55,
                        bedType: 'Queen',
                        viewType: 'Lagoon view',
                    },
                ],
                rating: 4.5,
                reviewCount: 542,
                checkInTime: '14:00',
                checkOutTime: '10:00',
                cancellationPolicy: {
                    type: 'flexible',
                    freeCancellationDays: 3,
                    penaltyPercentage: 0,
                },
                houseRules: ['Check-in time: 2 PM', 'Pets allowed in designated rooms'],
                isActive: true,
                featured: true,
                instantConfirmation: true,
                propertyFeatures: {
                    parking: true,
                    wifi: true,
                    pool: true,
                    gym: true,
                    spa: true,
                    restaurant: true,
                    bar: true,
                    airConditioning: true,
                    petsAllowed: true,
                    smokingAllowed: false,
                    wheelchairAccessible: true,
                    familyFriendly: true,
                    beach: true,
                    kitchen: false,
                    laundry: true,
                    elevator: true,
                    reception24h: true,
                },
                nearbyAttractions: [
                    { name: 'Port Vila Market', distance: 3, type: 'shopping' },
                    { name: 'Bauerfield International Airport', distance: 7, type: 'airport' },
                ],
            },
            {
                name: 'Coconut Palms Resort',
                description: 'Affordable beachfront accommodation with traditional bungalows, a relaxed atmosphere, and authentic island experiences.',
                propertyType: 'resort',
                starRating: 3,
                address: {
                    street: 'Mele Bay',
                    city: 'Port Vila',
                    state: 'Shefa',
                    country: 'Vanuatu',
                    zipCode: '',
                    coordinates: {
                        type: 'Point',
                        coordinates: [168.2845, -17.7123],
                    },
                },
                ownerId: users[2]._id,
                images: [
                    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
                    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
                ],
                amenities: ['WiFi', 'Pool', 'Restaurant', 'Beach Access', 'Snorkeling'],
                rooms: [
                    {
                        type: 'Beach Bungalow',
                        description: 'Traditional bungalow steps from the beach',
                        maxGuests: 2,
                        beds: 1,
                        bathrooms: 1,
                        pricePerNight: 120,
                        currency: 'USD',
                        available: true,
                        count: 12,
                        amenities: ['Queen Bed', 'Fan', 'Porch'],
                        mealPlan: 'none',
                        size: 25,
                        bedType: 'Queen',
                        viewType: 'Beach view',
                    },
                ],
                rating: 4.2,
                reviewCount: 156,
                checkInTime: '14:00',
                checkOutTime: '10:00',
                cancellationPolicy: {
                    type: 'flexible',
                    freeCancellationDays: 2,
                },
                houseRules: ['Quiet hours 10 PM - 7 AM', 'No smoking indoors'],
                isActive: true,
                featured: false,
                instantConfirmation: true,
                propertyFeatures: {
                    parking: true,
                    wifi: true,
                    pool: true,
                    gym: false,
                    spa: false,
                    restaurant: true,
                    bar: true,
                    airConditioning: false,
                    petsAllowed: false,
                    smokingAllowed: false,
                    wheelchairAccessible: false,
                    familyFriendly: true,
                    beach: true,
                    kitchen: false,
                    laundry: false,
                    elevator: false,
                    reception24h: false,
                },
            },
            {
                name: 'Espiritu Hideaway',
                description: 'Boutique beachfront property on Espiritu Santo, perfect for divers and adventurers. Close to the famous SS President Coolidge wreck.',
                propertyType: 'boutique-hotel',
                starRating: 4,
                address: {
                    street: 'Segond Channel',
                    city: 'Luganville',
                    state: 'Sanma',
                    country: 'Vanuatu',
                    zipCode: '',
                    coordinates: {
                        type: 'Point',
                        coordinates: [167.1723, -15.5123],
                    },
                },
                ownerId: users[2]._id,
                images: [
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
                    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                ],
                amenities: ['WiFi', 'Dive Center', 'Restaurant', 'Beach', 'Kayaks'],
                rooms: [
                    {
                        type: 'Ocean View Room',
                        description: 'Comfortable room with ocean views',
                        maxGuests: 2,
                        beds: 1,
                        bathrooms: 1,
                        pricePerNight: 150,
                        currency: 'USD',
                        available: true,
                        count: 10,
                        amenities: ['Queen Bed', 'Air Conditioning', 'Balcony'],
                        mealPlan: 'breakfast',
                        size: 30,
                        bedType: 'Queen',
                        viewType: 'Ocean view',
                    },
                    {
                        type: 'Dive Package Suite',
                        description: 'Suite with dive gear storage and ocean views',
                        maxGuests: 2,
                        beds: 1,
                        bathrooms: 1,
                        pricePerNight: 220,
                        currency: 'USD',
                        available: true,
                        count: 5,
                        amenities: ['King Bed', 'Dive Gear Storage', 'Ocean View', 'Kitchenette'],
                        mealPlan: 'breakfast',
                        size: 45,
                        bedType: 'King',
                        viewType: 'Ocean view',
                    },
                ],
                rating: 4.7,
                reviewCount: 198,
                checkInTime: '14:00',
                checkOutTime: '11:00',
                cancellationPolicy: {
                    type: 'moderate',
                    freeCancellationDays: 5,
                    penaltyPercentage: 30,
                },
                houseRules: ['Dive equipment to be rinsed at designated area', 'No smoking'],
                isActive: true,
                featured: true,
                instantConfirmation: true,
                propertyFeatures: {
                    parking: true,
                    wifi: true,
                    pool: false,
                    gym: false,
                    spa: false,
                    restaurant: true,
                    bar: true,
                    airConditioning: true,
                    petsAllowed: false,
                    smokingAllowed: false,
                    wheelchairAccessible: false,
                    familyFriendly: true,
                    beach: true,
                    kitchen: false,
                    laundry: true,
                    elevator: false,
                    reception24h: true,
                },
                nearbyAttractions: [
                    { name: 'SS President Coolidge Wreck', distance: 2, type: 'attraction' },
                    { name: 'Million Dollar Point', distance: 5, type: 'attraction' },
                    { name: 'Luganville Airport', distance: 3, type: 'airport' },
                ],
            },
            {
                name: 'Port Vila Central Apartments',
                description: 'Modern self-contained apartments in the heart of Port Vila, perfect for business travelers and families.',
                propertyType: 'apartment',
                starRating: 3,
                address: {
                    street: 'Kumul Highway',
                    city: 'Port Vila',
                    state: 'Shefa',
                    country: 'Vanuatu',
                    zipCode: '',
                    coordinates: {
                        type: 'Point',
                        coordinates: [168.3200, -17.7340],
                    },
                },
                ownerId: users[2]._id,
                images: [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1502672260066-6bc2862a9ce5?w=800',
                ],
                amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking', 'City Views'],
                rooms: [
                    {
                        type: 'One Bedroom Apartment',
                        description: 'Fully equipped apartment with kitchen',
                        maxGuests: 3,
                        beds: 1,
                        bathrooms: 1,
                        pricePerNight: 95,
                        currency: 'USD',
                        available: true,
                        count: 15,
                        amenities: ['Queen Bed', 'Full Kitchen', 'Living Room', 'Air Conditioning'],
                        mealPlan: 'none',
                        size: 50,
                        bedType: 'Queen',
                        viewType: 'City view',
                    },
                    {
                        type: 'Two Bedroom Apartment',
                        description: 'Spacious apartment for families',
                        maxGuests: 5,
                        beds: 2,
                        bathrooms: 2,
                        pricePerNight: 145,
                        currency: 'USD',
                        available: true,
                        count: 8,
                        amenities: ['Queen Bed', 'Twin Beds', 'Full Kitchen', 'Washer/Dryer'],
                        mealPlan: 'none',
                        size: 80,
                        bedType: 'Queen',
                        viewType: 'City view',
                    },
                ],
                rating: 4.3,
                reviewCount: 89,
                checkInTime: '15:00',
                checkOutTime: '10:00',
                cancellationPolicy: {
                    type: 'flexible',
                    freeCancellationDays: 2,
                },
                houseRules: ['No parties', 'Quiet hours 10 PM - 7 AM'],
                isActive: true,
                featured: false,
                instantConfirmation: true,
                propertyFeatures: {
                    parking: true,
                    wifi: true,
                    pool: false,
                    gym: false,
                    spa: false,
                    restaurant: false,
                    bar: false,
                    airConditioning: true,
                    petsAllowed: false,
                    smokingAllowed: false,
                    wheelchairAccessible: true,
                    familyFriendly: true,
                    beach: false,
                    kitchen: true,
                    laundry: true,
                    elevator: true,
                    reception24h: false,
                },
                nearbyAttractions: [
                    { name: 'Port Vila Market', distance: 0.5, type: 'shopping' },
                    { name: 'Restaurants & Cafes', distance: 0.2, type: 'restaurant' },
                ],
            },
        ]);

        console.log(`Created ${properties.length} properties`);

        // Note: Bookings and Reviews require complex data structures
        // They should be created through the application's normal booking flow
        console.log('Skipping bookings and reviews (create through app flow)...');

        // Create Flights
        console.log('Creating flights...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const flights = await Flight.insertMany([
            {
                flightNumber: 'NF101',
                airline: {
                    code: 'NF',
                    name: 'Air Vanuatu',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Air_Vanuatu_Logo.svg/320px-Air_Vanuatu_Logo.svg.png',
                },
                departure: {
                    airport: {
                        code: 'SYD',
                        name: 'Sydney Kingsford Smith Airport',
                        city: 'Sydney',
                        country: 'Australia',
                    },
                    terminal: '1',
                    dateTime: new Date(tomorrow.setHours(9, 30)),
                },
                arrival: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu',
                    },
                    dateTime: new Date(tomorrow.setHours(14, 45)),
                },
                duration: 255,
                aircraft: {
                    type: 'Boeing',
                    model: '737-800',
                },
                classes: {
                    economy: {
                        available: 85,
                        price: 420,
                        currency: 'USD',
                        amenities: ['Meal', 'Beverage', '20kg Baggage'],
                        baggage: {
                            checked: '20kg',
                            cabin: '7kg',
                            checkedAllowance: 20,
                            cabinAllowance: 7,
                        },
                    },
                    business: {
                        available: 12,
                        price: 1200,
                        currency: 'USD',
                        amenities: ['Priority Boarding', 'Premium Meals', 'Extra Legroom', '30kg Baggage'],
                        baggage: {
                            checked: '30kg',
                            cabin: '10kg',
                            checkedAllowance: 30,
                            cabinAllowance: 10,
                        },
                    },
                },
                isInternational: true,
                status: 'scheduled',
                isActive: true,
            },
            {
                flightNumber: 'NF102',
                airline: {
                    code: 'NF',
                    name: 'Air Vanuatu',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Air_Vanuatu_Logo.svg/320px-Air_Vanuatu_Logo.svg.png',
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu',
                    },
                    dateTime: new Date(nextWeek.setHours(15, 45)),
                },
                arrival: {
                    airport: {
                        code: 'SYD',
                        name: 'Sydney Kingsford Smith Airport',
                        city: 'Sydney',
                        country: 'Australia',
                    },
                    terminal: '1',
                    dateTime: new Date(nextWeek.setHours(18, 30)),
                },
                duration: 225,
                aircraft: {
                    type: 'Boeing',
                    model: '737-800',
                },
                classes: {
                    economy: {
                        available: 92,
                        price: 445,
                        currency: 'USD',
                        amenities: ['Meal', 'Beverage', '20kg Baggage'],
                        baggage: {
                            checked: '20kg',
                            cabin: '7kg',
                            checkedAllowance: 20,
                            cabinAllowance: 7,
                        },
                    },
                    business: {
                        available: 15,
                        price: 1250,
                        currency: 'USD',
                        amenities: ['Priority Boarding', 'Premium Meals', 'Extra Legroom', '30kg Baggage'],
                        baggage: {
                            checked: '30kg',
                            cabin: '10kg',
                            checkedAllowance: 30,
                            cabinAllowance: 10,
                        },
                    },
                },
                isInternational: true,
                status: 'scheduled',
                isActive: true,
            },
            {
                flightNumber: 'NF201',
                airline: {
                    code: 'NF',
                    name: 'Air Vanuatu',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Air_Vanuatu_Logo.svg/320px-Air_Vanuatu_Logo.svg.png',
                },
                departure: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu',
                    },
                    dateTime: new Date(tomorrow.setHours(8, 0)),
                },
                arrival: {
                    airport: {
                        code: 'SON',
                        name: 'Santo-Pekoa International Airport',
                        city: 'Luganville',
                        country: 'Vanuatu',
                    },
                    dateTime: new Date(tomorrow.setHours(9, 15)),
                },
                duration: 75,
                aircraft: {
                    type: 'ATR',
                    model: '72-600',
                },
                classes: {
                    economy: {
                        available: 45,
                        price: 120,
                        currency: 'USD',
                        amenities: ['Snack', 'Beverage', '15kg Baggage'],
                        baggage: {
                            checked: '15kg',
                            cabin: '5kg',
                            checkedAllowance: 15,
                            cabinAllowance: 5,
                        },
                    },
                },
                isInternational: false,
                status: 'scheduled',
                isActive: true,
            },
            {
                flightNumber: 'QF245',
                airline: {
                    code: 'QF',
                    name: 'Qantas',
                    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Qantas_logo.svg/320px-Qantas_logo.svg.png',
                },
                departure: {
                    airport: {
                        code: 'BNE',
                        name: 'Brisbane Airport',
                        city: 'Brisbane',
                        country: 'Australia',
                    },
                    terminal: 'D',
                    dateTime: new Date(tomorrow.setHours(10, 15)),
                },
                arrival: {
                    airport: {
                        code: 'VLI',
                        name: 'Bauerfield International Airport',
                        city: 'Port Vila',
                        country: 'Vanuatu',
                    },
                    dateTime: new Date(tomorrow.setHours(15, 0)),
                },
                duration: 225,
                aircraft: {
                    type: 'Airbus',
                    model: 'A320',
                },
                classes: {
                    economy: {
                        available: 105,
                        price: 395,
                        currency: 'USD',
                        amenities: ['Meal', 'Entertainment', '23kg Baggage'],
                        baggage: {
                            checked: '23kg',
                            cabin: '7kg',
                            checkedAllowance: 23,
                            cabinAllowance: 7,
                        },
                    },
                    business: {
                        available: 18,
                        price: 1100,
                        currency: 'USD',
                        amenities: ['Lounge Access', 'Lie-flat Seats', 'Premium Dining', '32kg Baggage'],
                        baggage: {
                            checked: '32kg',
                            cabin: '10kg',
                            checkedAllowance: 32,
                            cabinAllowance: 10,
                        },
                    },
                },
                isInternational: true,
                status: 'scheduled',
                isActive: true,
            },
        ]);

        console.log(`Created ${flights.length} flights`);

        // Create Services
        console.log('Creating services...');
        const services = await Service.insertMany([
            {
                name: 'Blue Lagoon & Cascades Tour',
                description: 'Visit the stunning Blue Lagoon and Mele Cascades waterfall. Includes swimming, lunch, and transportation.',
                category: 'tour',
                providerId: users[1]._id,
                location: 'Port Vila, Vanuatu',
                price: 85,
                currency: 'USD',
                duration: 360,
                capacity: 15,
                images: [
                    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                ],
                rating: 4.8,
                reviewCount: 234,
                maxParticipants: 15,
                included: ['Hotel pickup', 'Lunch', 'Entrance fees', 'Guide'],
                requirements: ['Swimsuit', 'Towel', 'Sunscreen', 'Water shoes recommended'],
                availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
                availableHours: { start: '08:00', end: '16:00' },
                isActive: true,
            },
            {
                name: 'Scuba Diving - Beginner',
                description: 'Introduction to scuba diving in the crystal clear waters of Vanuatu. Perfect for first-timers.',
                category: 'diving',
                providerId: users[2]._id,
                location: 'Port Vila Harbor, Port Vila',
                price: 120,
                currency: 'USD',
                duration: 180,
                capacity: 6,
                images: [
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                ],
                rating: 4.9,
                reviewCount: 187,
                maxParticipants: 6,
                included: ['All equipment', 'Instructor', 'Boat trip', 'Refreshments'],
                requirements: ['Must be able to swim', 'Health declaration form', 'Minimum age 12'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '09:00', end: '14:00' },
                isActive: true,
            },
            {
                name: 'SS President Coolidge Wreck Dive',
                description: 'World-famous wreck dive on the luxury liner sunk in WWII. For certified divers only.',
                category: 'diving',
                providerId: users[2]._id,
                location: 'Million Dollar Point, Luganville',
                price: 180,
                currency: 'USD',
                duration: 240,
                capacity: 8,
                images: [
                    'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800',
                ],
                rating: 5.0,
                reviewCount: 412,
                maxParticipants: 8,
                included: ['All equipment', 'Dive guide', 'Multiple dives', 'Lunch'],
                requirements: ['Advanced Open Water certification', 'Minimum 30 logged dives', 'Wreck diving experience'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '07:00', end: '15:00' },
                isActive: true,
            },
            {
                name: 'Island Hopping Adventure',
                description: 'Explore multiple islands in one day. Snorkeling, beach time, and traditional village visit included.',
                category: 'tour',
                providerId: users[1]._id,
                location: 'Port Vila Wharf, Port Vila',
                price: 145,
                currency: 'USD',
                duration: 480,
                capacity: 20,
                images: [
                    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
                ],
                rating: 4.7,
                reviewCount: 156,
                maxParticipants: 20,
                included: ['Boat transport', 'Snorkeling equipment', 'Lunch', 'Village entry fee', 'Guide'],
                requirements: ['Sunscreen', 'Hat', 'Camera', 'Cash for souvenirs'],
                availableDays: [1, 3, 5], // Mon, Wed, Fri
                availableHours: { start: '08:00', end: '16:00' },
                isActive: true,
            },
            {
                name: 'Sunset Cruise',
                description: 'Romantic sunset cruise around Port Vila harbor with champagne and canapés.',
                category: 'tour',
                providerId: users[1]._id,
                location: 'Port Vila Marina, Port Vila',
                price: 95,
                currency: 'USD',
                duration: 120,
                capacity: 30,
                images: [
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                ],
                rating: 4.6,
                reviewCount: 89,
                maxParticipants: 30,
                included: ['Champagne', 'Canapés', 'Live music'],
                requirements: ['Smart casual dress code'],
                availableDays: [0, 1, 2, 3, 4, 5, 6],
                availableHours: { start: '17:00', end: '19:00' },
                isActive: true,
            },
        ]);

        console.log(`Created ${services.length} services`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest accounts created:');
        console.log('Admin: admin@vanuatu.com / password123');
        console.log('Host 1: host1@vanuatu.com / password123');
        console.log('Host 2: host2@vanuatu.com / password123');
        console.log('Customer 1: customer1@example.com / password123');
        console.log('Customer 2: customer2@example.com / password123');

        console.log('\nData summary:');
        console.log(`- ${users.length} users`);
        console.log(`- ${properties.length} properties`);
        console.log(`- ${flights.length} flights`);
        console.log(`- ${services.length} services`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

seedDatabase();
