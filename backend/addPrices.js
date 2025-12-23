// Quick Price Management Script
// Run with: node addPrices.js

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vanuatu-booking');

// Define schemas (simplified)
const PropertySchema = new mongoose.Schema({}, { strict: false });
const ServiceSchema = new mongoose.Schema({}, { strict: false });
const PackageSchema = new mongoose.Schema({}, { strict: false });

const Property = mongoose.model('Property', PropertySchema);
const Service = mongoose.model('Service', ServiceSchema);
const TravelPackage = mongoose.model('TravelPackage', PackageSchema);

// =======================
// ADD NEW HOTEL WITH PRICE
// =======================
async function addHotel() {
    const hotel = await Property.create({
        name: "Sunset Beach Resort",
        description: "Luxury beachfront resort with stunning sunset views",
        propertyType: "resort",
        address: {
            street: "Coastal Road",
            city: "Port Vila",
            state: "Shefa",
            country: "Vanuatu",
            zipCode: "0000",
            coordinates: { lat: -17.7489, lng: 168.3012 }
        },
        ownerId: new mongoose.Types.ObjectId(), // Replace with actual host ID
        images: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ],
        amenities: ["Pool", "Beach Access", "Restaurant", "Spa", "WiFi", "Bar"],
        rooms: [
            {
                type: "Standard Ocean View",
                description: "Comfortable room with ocean views",
                maxGuests: 2,
                beds: 1,
                bathrooms: 1,
                pricePerNight: 14000, // 14,000 VUV per night
                currency: "VUV",
                available: true,
                count: 15,
                amenities: ["WiFi", "AC", "TV", "Balcony"]
            },
            {
                type: "Deluxe Suite",
                description: "Spacious suite with premium amenities",
                maxGuests: 4,
                beds: 2,
                bathrooms: 2,
                pricePerNight: 28000, // 28,000 VUV per night
                currency: "VUV",
                available: true,
                count: 8,
                amenities: ["WiFi", "AC", "TV", "Minibar", "Ocean View", "Balcony"]
            },
            {
                type: "Presidential Suite",
                description: "Luxury suite with private pool",
                maxGuests: 6,
                beds: 3,
                bathrooms: 3,
                pricePerNight: 50000, // 50,000 VUV per night
                currency: "VUV",
                available: true,
                count: 2,
                amenities: ["WiFi", "AC", "TV", "Private Pool", "Butler Service", "Kitchen"]
            }
        ],
        rating: 4.5,
        reviewCount: 0,
        checkInTime: "14:00",
        checkOutTime: "11:00",
        cancellationPolicy: "moderate",
        houseRules: ["No smoking", "No pets", "No parties"],
        isActive: true,
        featured: true
    });

    console.log('✅ Hotel added:', hotel.name);
    console.log(`   - Standard Room: ${hotel.rooms[0].pricePerNight} VUV/night`);
    console.log(`   - Deluxe Suite: ${hotel.rooms[1].pricePerNight} VUV/night`);
    console.log(`   - Presidential Suite: ${hotel.rooms[2].pricePerNight} VUV/night`);
}

// =======================
// ADD NEW TOUR WITH PRICE
// =======================
async function addTour() {
    const tour = await Service.create({
        name: "Mele Cascades Waterfall Tour",
        description: "Guided tour to the stunning Mele Cascades with swimming opportunities",
        category: "adventure",
        price: 6500, // 6,500 VUV per person
        currency: "VUV",
        duration: 180, // 3 hours
        capacity: 25,
        location: "Mele Village, Port Vila",
        images: [
            "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800"
        ],
        availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
        availableHours: { start: "09:00", end: "17:00" },
        isActive: true,
        amenities: ["Transport", "Guide", "Entrance Fee", "Swimming"]
    });

    console.log('✅ Tour added:', tour.name);
    console.log(`   - Price: ${tour.price} VUV per person`);
    console.log(`   - Duration: ${tour.duration} minutes`);
}

// =======================
// ADD NEW PACKAGE WITH PRICE
// =======================
async function addPackage() {
    const pkg = await TravelPackage.create({
        name: "Ultimate Vanuatu Experience",
        description: "10-day luxury package including multiple islands",
        images: [
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
        ],
        destination: "Multiple Islands",
        destinationCoordinates: { lat: -17.7334, lng: 168.3273 },
        duration: { days: 10, nights: 9 },
        includes: {
            flights: true,
            accommodation: true,
            transfers: true,
            tours: true,
            meals: "full-board",
            carRental: true,
            insurance: false
        },
        itinerary: [
            {
                day: 1,
                title: "Arrival in Port Vila",
                description: "Welcome to Vanuatu! Transfer to hotel and relax",
                activities: ["Airport pickup", "Hotel check-in", "Welcome dinner"],
                meals: ["Dinner"],
                accommodation: "5-star resort"
            },
            // Add more days...
        ],
        pricing: {
            basePrice: 295000, // 295,000 VUV per person
            currency: "VUV",
            priceIncludes: [
                "All accommodation",
                "All meals",
                "All tours and activities",
                "Internal flights",
                "Airport transfers",
                "English-speaking guide"
            ],
            priceExcludes: [
                "International flights",
                "Travel insurance",
                "Personal expenses",
                "Alcoholic beverages"
            ],
            discountPercentage: 15 // 15% discount
        },
        availability: {
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            maxParticipants: 12,
            minParticipants: 2,
            currentBookings: 0
        },
        category: "luxury",
        difficulty: "easy",
        highlights: [
            "Visit 3 different islands",
            "Volcano night trek",
            "Blue lagoon snorkeling",
            "Cultural village experience",
            "Luxury accommodations"
        ],
        rating: 4.8,
        reviewCount: 0,
        isActive: true,
        isFeatured: true,
        createdBy: new mongoose.Types.ObjectId()
    });

    const discountedPrice = pkg.pricing.basePrice * (1 - pkg.pricing.discountPercentage / 100);
    console.log('✅ Package added:', pkg.name);
    console.log(`   - Base Price: ${pkg.pricing.basePrice} VUV`);
    console.log(`   - Discount: ${pkg.pricing.discountPercentage}%`);
    console.log(`   - Final Price: ${Math.round(discountedPrice)} VUV per person`);
}

// =======================
// UPDATE EXISTING PRICES
// =======================
async function updateAllHotelPrices(increasePercent) {
    const result = await Property.updateMany(
        {},
        [
            {
                $set: {
                    rooms: {
                        $map: {
                            input: "$rooms",
                            as: "room",
                            in: {
                                $mergeObjects: [
                                    "$$room",
                                    {
                                        pricePerNight: {
                                            $multiply: ["$$room.pricePerNight", 1 + (increasePercent / 100)]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]
    );

    console.log(`✅ Updated ${result.modifiedCount} hotel prices by ${increasePercent}%`);
}

async function updateTourCategory(category, newPrice) {
    const result = await Service.updateMany(
        { category: category },
        { $set: { price: newPrice, currency: "VUV" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} tours in "${category}" to ${newPrice} VUV`);
}

// =======================
// VIEW CURRENT PRICES
// =======================
async function showAllPrices() {
    console.log('\n📊 CURRENT PRICES\n');

    // Hotels
    const hotels = await Property.find({}).limit(5);
    console.log('🏨 HOTELS:');
    hotels.forEach(hotel => {
        console.log(`\n${hotel.name}`);
        hotel.rooms.forEach(room => {
            console.log(`  - ${room.type}: ${room.pricePerNight} VUV/night`);
        });
    });

    // Tours
    const tours = await Service.find({}).limit(5);
    console.log('\n\n🎯 TOURS:');
    tours.forEach(tour => {
        console.log(`  - ${tour.name}: ${tour.price} VUV (${tour.duration} min)`);
    });

    // Packages
    const packages = await TravelPackage.find({}).limit(5);
    console.log('\n\n📦 PACKAGES:');
    packages.forEach(pkg => {
        const discounted = pkg.pricing.discountPercentage
            ? pkg.pricing.basePrice * (1 - pkg.pricing.discountPercentage / 100)
            : pkg.pricing.basePrice;
        console.log(`  - ${pkg.name}: ${Math.round(discounted)} VUV (${pkg.duration.days} days)`);
    });
}

// =======================
// MAIN MENU
// =======================
async function main() {
    console.log('🏝️  VANUATU BOOKING SYSTEM - PRICE MANAGER\n');
    console.log('Choose an option:');
    console.log('1. Add new hotel with prices');
    console.log('2. Add new tour with price');
    console.log('3. Add new package with price');
    console.log('4. Update all hotel prices (+10%)');
    console.log('5. Update sightseeing tour prices to 8,500 VUV');
    console.log('6. Show all current prices');

    const choice = process.argv[2] || '6';

    try {
        switch (choice) {
            case '1':
                await addHotel();
                break;
            case '2':
                await addTour();
                break;
            case '3':
                await addPackage();
                break;
            case '4':
                await updateAllHotelPrices(10);
                break;
            case '5':
                await updateTourCategory('sightseeing', 8500);
                break;
            case '6':
                await showAllPrices();
                break;
            default:
                console.log('Invalid option');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Done!');
    }
}

main();
