import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking';
import User from '../models/User';
import Service from '../models/Service';
import Property from '../models/Property';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vanuatu-travel-hub';

// Sample data
const generateDummyBookings = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get sample users, services, and properties
        const users = await User.find().limit(5);
        const services = await Service.find().limit(5);
        const properties = await Property.find().limit(5);

        if (users.length === 0) {
            console.log('⚠️  No users found. Please create users first.');
            return;
        }

        // Clear existing bookings (optional - comment out if you want to keep existing data)
        // await Booking.deleteMany({});
        // console.log('🗑️  Cleared existing bookings');

        const dummyBookings = [];
        const bookingTypes = ['property', 'service', 'flight', 'car-rental', 'transfer', 'package'];
        const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];
        const paymentStatuses = ['unpaid', 'partial', 'paid', 'refunded', 'failed'];
        const paymentMethods = ['cash', 'credit-card', 'debit-card', 'mobile-money', 'bank-transfer', 'paypal', 'stripe', 'eftpos'];

        for (let i = 0; i < 20; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const bookingType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days

            const checkInDate = new Date(baseDate);
            checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 60)); // Check-in within 60 days

            const nights = Math.floor(Math.random() * 7) + 1;
            const checkOutDate = new Date(checkInDate);
            checkOutDate.setDate(checkOutDate.getDate() + nights);

            const unitPrice = Math.floor(Math.random() * 50000) + 10000; // VUV 10,000 - 60,000
            const quantity = Math.floor(Math.random() * 3) + 1;
            const subtotal = unitPrice * quantity;
            const discountAmount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0; // 10% discount randomly
            const taxRate = 15; // Vanuatu VAT
            const taxAmount = Math.floor((subtotal - discountAmount) * (taxRate / 100));
            const totalAmount = subtotal - discountAmount + taxAmount;
            const paidAmount = paymentStatus === 'paid' ? totalAmount :
                paymentStatus === 'partial' ? Math.floor(totalAmount * 0.5) : 0;

            const booking: any = {
                userId: user._id,
                bookingType,
                reservationNumber: `VU-2025-${String(100000 + i).substring(1)}`,
                referenceNumber: `REF-${Date.now()}-${i}`,
                bookingDate: baseDate,
                status,
                bookingSource: ['online', 'counter', 'agent', 'mobile-app'][Math.floor(Math.random() * 4)],

                // Resource allocation
                resourceAllocation: {
                    resourceId: `RES-${Math.floor(Math.random() * 999)}`,
                    resourceType: ['room', 'seat', 'vehicle', 'staff'][Math.floor(Math.random() * 4)],
                    resourceName: `Resource ${Math.floor(Math.random() * 50) + 1}`,
                    capacity: Math.floor(Math.random() * 10) + 1,
                    allocatedQuantity: quantity,
                    availabilityStatus: 'allocated',
                    assignedBy: user._id,
                    assignedAt: new Date(),
                    notes: 'Auto-assigned by system'
                },

                // Pricing
                pricing: {
                    unitPrice,
                    quantity,
                    subtotal,
                    discount: discountAmount > 0 ? {
                        type: 'percentage',
                        value: 10,
                        code: 'WELCOME10',
                        reason: 'Welcome discount'
                    } : undefined,
                    discountAmount,
                    taxRate,
                    taxAmount,
                    totalAmount,
                    currency: 'VUV'
                },

                // Payment
                payment: {
                    status: paymentStatus,
                    method: paymentMethod,
                    reference: `PAY-${Date.now()}-${i}`,
                    transactionId: `TXN-${Date.now()}-${i}`,
                    paidAmount,
                    remainingAmount: totalAmount - paidAmount,
                    paidAt: paidAmount > 0 ? new Date() : undefined,
                    paymentDetails: paymentMethod.includes('card') ? {
                        cardLastFour: String(Math.floor(Math.random() * 9999)).padStart(4, '0'),
                        cardBrand: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)]
                    } : paymentMethod === 'mobile-money' ? {
                        mobileProvider: ['Digicel', 'Vodafone'][Math.floor(Math.random() * 2)]
                    } : undefined
                },

                // Check-in/out
                checkIn: status === 'completed' || status === 'confirmed' ? {
                    status: 'checked-in',
                    checkedInAt: checkInDate,
                    checkedInBy: user._id,
                    actualArrivalTime: checkInDate,
                    notes: 'Smooth check-in process',
                    location: {
                        type: 'Point',
                        coordinates: [168.3273 + Math.random() * 0.1, -17.7334 + Math.random() * 0.1]
                    }
                } : undefined,

                checkOut: status === 'completed' ? {
                    status: 'checked-out',
                    checkedOutAt: checkOutDate,
                    checkedOutBy: user._id,
                    actualDepartureTime: checkOutDate,
                    notes: 'Room inspected, all good'
                } : undefined,

                // QR Code and Barcode
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=VU-2025-${String(100000 + i).substring(1)}`,
                barcode: `*VU2025${String(100000 + i).substring(1)}*`,

                // Terms and signature
                termsAccepted: true,
                termsAcceptedAt: baseDate,
                signature: {
                    data: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIj48dGV4dCB4PSIxMCIgeT0iMzAiPkpvaG4gRG9lPC90ZXh0Pjwvc3ZnPg==`,
                    signedAt: baseDate,
                    deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
                },

                // Dates
                checkInDate,
                checkOutDate,
                startDate: checkInDate,
                endDate: checkOutDate,
                nights,

                // Guest details
                guestCount: Math.floor(Math.random() * 4) + 1,
                guestDetails: {
                    firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'][Math.floor(Math.random() * 6)],
                    lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][Math.floor(Math.random() * 6)],
                    email: `guest${i}@example.com`,
                    phone: `+678${Math.floor(Math.random() * 9999999)}`
                },
                guests: [
                    {
                        firstName: ['John', 'Jane', 'Michael', 'Sarah'][Math.floor(Math.random() * 4)],
                        lastName: ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)],
                        email: `guest${i}@example.com`,
                        phone: `+678${Math.floor(Math.random() * 9999999)}`,
                        dateOfBirth: new Date(1990, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
                    }
                ],

                // Special requests
                specialRequests: [
                    'Late check-in requested',
                    'Sea view room preferred',
                    'Extra towels needed',
                    'Vegetarian meals',
                    'Airport pickup required'
                ][Math.floor(Math.random() * 5)],

                notes: 'Dummy booking data for testing and demonstration purposes.',

                // Link to service or property
                ...(bookingType === 'service' && services.length > 0 && {
                    serviceId: services[Math.floor(Math.random() * services.length)]._id
                }),
                ...(bookingType === 'property' && properties.length > 0 && {
                    propertyId: properties[Math.floor(Math.random() * properties.length)]._id,
                    roomType: ['Standard', 'Deluxe', 'Suite', 'Bungalow'][Math.floor(Math.random() * 4)]
                }),

                // Flight booking details (if applicable)
                ...(bookingType === 'flight' && {
                    flightClass: ['economy', 'business', 'firstClass'][Math.floor(Math.random() * 3)],
                    passengers: {
                        adults: Math.floor(Math.random() * 3) + 1,
                        children: Math.floor(Math.random() * 2),
                        infants: 0
                    },
                    passengerDetails: [
                        {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: new Date(1990, 5, 15),
                            passportNumber: `P${Math.floor(Math.random() * 9999999)}`,
                            nationality: 'Vanuatu'
                        }
                    ]
                }),

                // Geolocation (for transfers)
                ...(bookingType === 'transfer' && {
                    geolocation: {
                        pickup: {
                            type: 'Point',
                            coordinates: [168.3273, -17.7334],
                            address: 'Bauerfield International Airport, Port Vila',
                            timestamp: checkInDate
                        },
                        dropoff: {
                            type: 'Point',
                            coordinates: [168.3500, -17.7500],
                            address: 'Iririki Island Resort, Port Vila',
                            timestamp: new Date(checkInDate.getTime() + 30 * 60000) // 30 min later
                        }
                    }
                }),

                // Legacy fields for compatibility
                totalPrice: totalAmount,
                depositAmount: Math.floor(totalAmount * 0.3),
                depositPaid: paymentStatus !== 'unpaid'
            };

            dummyBookings.push(booking);
        }

        // Insert bookings
        const inserted = await Booking.insertMany(dummyBookings);
        console.log(`✅ Successfully created ${inserted.length} dummy bookings!`);

        // Display summary
        console.log('\n📊 Booking Summary:');
        console.log(`   Total: ${inserted.length}`);
        console.log(`   Confirmed: ${inserted.filter(b => b.status === 'confirmed').length}`);
        console.log(`   Pending: ${inserted.filter(b => b.status === 'pending').length}`);
        console.log(`   Completed: ${inserted.filter(b => b.status === 'completed').length}`);
        console.log(`   Cancelled: ${inserted.filter(b => b.status === 'cancelled').length}`);
        console.log(`\n💰 Payment Summary:`);
        console.log(`   Paid: ${inserted.filter(b => b.payment?.status === 'paid').length}`);
        console.log(`   Partial: ${inserted.filter(b => b.payment?.status === 'partial').length}`);
        console.log(`   Unpaid: ${inserted.filter(b => b.payment?.status === 'unpaid').length}`);

    } catch (error) {
        console.error('❌ Error seeding bookings:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
};

// Run the script
generateDummyBookings();
