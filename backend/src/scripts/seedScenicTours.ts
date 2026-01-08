import mongoose from 'mongoose';
import ScenicFlyTour from '../models/ScenicFlyTour';
import dotenv from 'dotenv';

dotenv.config();

const scenicTours = [
    {
        name: "Volcano & Islands Explorer",
        description: "Experience the raw power and beauty of Vanuatu's active volcanoes from the air. This comprehensive scenic flight takes you over Mt. Yasur, one of the world's most accessible active volcanoes, along with stunning views of Tanna's pristine coastline, lush rainforests, and traditional villages. Witness the breathtaking contrast between fiery volcanic landscapes and turquoise waters.",
        images: [
            "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
        ],
        duration: 90,
        route: {
            departure: {
                location: "Tanna Airport (TAH)",
                coordinates: {
                    lat: -19.4553,
                    lng: 169.2234
                }
            },
            highlights: [
                {
                    name: "Mt. Yasur Volcano",
                    description: "Active volcano with spectacular lava displays and volcanic activity",
                    coordinates: {
                        lat: -19.532,
                        lng: 169.447
                    },
                    timeOverLocation: 15
                },
                {
                    name: "Sulphur Bay Village",
                    description: "Traditional village with stunning coastal views and cultural significance",
                    coordinates: {
                        lat: -19.533,
                        lng: 169.398
                    },
                    timeOverLocation: 5
                },
                {
                    name: "Port Resolution Bay",
                    description: "Historic bay with crystal-clear waters and rich marine life",
                    coordinates: {
                        lat: -19.542,
                        lng: 169.467
                    },
                    timeOverLocation: 10
                },
                {
                    name: "Lenakel Town",
                    description: "Main town of Tanna with panoramic coastal and mountain views",
                    coordinates: {
                        lat: -19.471,
                        lng: 169.261
                    },
                    timeOverLocation: 5
                }
            ],
            return: {
                location: "Tanna Airport (TAH)",
                coordinates: {
                    lat: -19.4553,
                    lng: 169.2234
                }
            }
        },
        aircraft: {
            type: "Single Engine",
            model: "Cessna 206",
            capacity: 5,
            features: [
                "Panoramic windows",
                "Air conditioning",
                "Noise-cancelling headphones",
                "High-wing design for unobstructed views"
            ]
        },
        pricing: {
            perPerson: 25000,
            currency: "VUV",
            privateCharter: 120000,
            childDiscount: 15,
            groupDiscount: {
                minimumPeople: 4,
                discountPercentage: 10
            }
        },
        schedule: {
            availableDays: [0, 2, 4, 6],
            timeSlots: [
                {
                    departureTime: "07:00",
                    availableSeats: 5
                },
                {
                    departureTime: "10:00",
                    availableSeats: 5
                },
                {
                    departureTime: "14:00",
                    availableSeats: 5
                }
            ]
        },
        includes: [
            "Experienced pilot with live commentary",
            "Complimentary refreshments",
            "Photo opportunities at all waypoints",
            "Safety briefing",
            "Souvenir flight certificate",
            "Hotel pickup (selected accommodations)"
        ],
        requirements: {
            minimumAge: 5,
            weightLimit: 120,
            healthRestrictions: [
                "Not suitable for pregnant women",
                "Not recommended for those with severe motion sickness",
                "Heart condition restrictions apply"
            ],
            weatherDependent: true
        },
        cancellationPolicy: {
            freeCancellation: 24,
            refundPercentage: {
                moreThan24Hours: 100,
                lessThan24Hours: 50,
                lessThan12Hours: 0
            }
        },
        rating: 4.9,
        reviewCount: 127,
        totalBookings: 342,
        isActive: true,
        isFeatured: true,
        safetyInformation: [
            "All aircraft undergo regular maintenance and safety inspections",
            "Pilots are certified with thousands of flight hours",
            "Life jackets provided for overwater segments",
            "Emergency communication equipment onboard",
            "Comprehensive insurance coverage included"
        ],
        maxBookingsPerDay: 3
    },
    {
        name: "Blue Lagoon & Coral Reefs",
        description: "Discover Vanuatu's world-famous blue holes, pristine lagoons, and vibrant coral reefs from above. This spectacular scenic flight showcases the incredible diversity of colors in Vanuatu's waters, from deep ocean blues to turquoise lagoons and the famous Champagne Beach. Perfect for photography enthusiasts and nature lovers.",
        images: [
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
            "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800"
        ],
        duration: 60,
        route: {
            departure: {
                location: "Port Vila (Bauerfield Airport)",
                coordinates: {
                    lat: -17.6993,
                    lng: 168.3197
                }
            },
            highlights: [
                {
                    name: "Mele Cascades",
                    description: "Beautiful waterfall surrounded by lush tropical forest",
                    coordinates: {
                        lat: -17.7833,
                        lng: 168.2667
                    },
                    timeOverLocation: 5
                },
                {
                    name: "Hideaway Island",
                    description: "Underwater post office and stunning coral gardens",
                    coordinates: {
                        lat: -17.7472,
                        lng: 168.2914
                    },
                    timeOverLocation: 8
                },
                {
                    name: "Blue Lagoon",
                    description: "Crystal-clear blue hole with vibrant marine life",
                    coordinates: {
                        lat: -17.7124,
                        lng: 168.2893
                    },
                    timeOverLocation: 10
                },
                {
                    name: "Erakor Island",
                    description: "Private island resort with stunning beaches",
                    coordinates: {
                        lat: -17.7389,
                        lng: 168.3361
                    },
                    timeOverLocation: 7
                }
            ],
            return: {
                location: "Port Vila (Bauerfield Airport)",
                coordinates: {
                    lat: -17.6993,
                    lng: 168.3197
                }
            }
        },
        aircraft: {
            type: "Twin Engine",
            model: "Britten-Norman Islander",
            capacity: 8,
            features: [
                "Large panoramic windows",
                "Twin engine safety",
                "Individual headsets with music",
                "Spacious cabin"
            ]
        },
        pricing: {
            perPerson: 18000,
            currency: "VUV",
            privateCharter: 140000,
            childDiscount: 20,
            groupDiscount: {
                minimumPeople: 6,
                discountPercentage: 15
            }
        },
        schedule: {
            availableDays: [1, 2, 3, 4, 5, 6],
            timeSlots: [
                {
                    departureTime: "08:00",
                    availableSeats: 8
                },
                {
                    departureTime: "11:00",
                    availableSeats: 8
                },
                {
                    departureTime: "15:00",
                    availableSeats: 8
                }
            ]
        },
        includes: [
            "Professional pilot commentary",
            "Bottled water and snacks",
            "Photography guide and tips",
            "Digital photo package available",
            "Marine life identification chart",
            "USB with flight path map"
        ],
        requirements: {
            minimumAge: 3,
            weightLimit: 110,
            healthRestrictions: [
                "No restrictions for most passengers"
            ],
            weatherDependent: true
        },
        cancellationPolicy: {
            freeCancellation: 24,
            refundPercentage: {
                moreThan24Hours: 100,
                lessThan24Hours: 50,
                lessThan12Hours: 0
            }
        },
        rating: 4.8,
        reviewCount: 203,
        totalBookings: 567,
        isActive: true,
        isFeatured: true,
        safetyInformation: [
            "Twin-engine aircraft for enhanced safety",
            "Regular maintenance schedule exceeds requirements",
            "Experienced pilots with local knowledge",
            "Weather monitoring before each flight",
            "Full insurance coverage"
        ],
        maxBookingsPerDay: 4
    },
    {
        name: "Northern Islands Paradise",
        description: "Explore the breathtaking beauty of Vanuatu's northern islands from the sky. This extended scenic flight takes you over Espiritu Santo, the largest island in Vanuatu, featuring the world-famous Champagne Beach, Million Dollar Point, and pristine coral atolls. Witness untouched paradise and historical WWII sites.",
        images: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800",
            "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=800"
        ],
        duration: 120,
        route: {
            departure: {
                location: "Santo-Pekoa Airport",
                coordinates: {
                    lat: -15.5053,
                    lng: 167.2197
                }
            },
            highlights: [
                {
                    name: "Champagne Beach",
                    description: "Consistently rated as one of the world's best beaches",
                    coordinates: {
                        lat: -15.3833,
                        lng: 167.1167
                    },
                    timeOverLocation: 12
                },
                {
                    name: "Million Dollar Point",
                    description: "WWII historical site where military equipment was dumped",
                    coordinates: {
                        lat: -15.5442,
                        lng: 167.1928
                    },
                    timeOverLocation: 8
                },
                {
                    name: "Blue Holes",
                    description: "Natural freshwater swimming holes with incredible colors",
                    coordinates: {
                        lat: -15.3861,
                        lng: 167.1486
                    },
                    timeOverLocation: 10
                },
                {
                    name: "Port Olry",
                    description: "Pristine beaches and coral reefs",
                    coordinates: {
                        lat: -15.0833,
                        lng: 166.9833
                    },
                    timeOverLocation: 10
                },
                {
                    name: "Tutuba Island",
                    description: "Small island with stunning coral formations",
                    coordinates: {
                        lat: -15.1167,
                        lng: 167.0667
                    },
                    timeOverLocation: 8
                }
            ],
            return: {
                location: "Santo-Pekoa Airport",
                coordinates: {
                    lat: -15.5053,
                    lng: 167.2197
                }
            }
        },
        aircraft: {
            type: "Multi-Engine",
            model: "Twin Otter DHC-6",
            capacity: 12,
            features: [
                "High-wing design for perfect visibility",
                "Climate-controlled cabin",
                "Premium headsets with adjustable volume",
                "Extra legroom and comfort"
            ]
        },
        pricing: {
            perPerson: 35000,
            currency: "VUV",
            privateCharter: 400000,
            childDiscount: 10,
            groupDiscount: {
                minimumPeople: 8,
                discountPercentage: 12
            }
        },
        schedule: {
            availableDays: [0, 3, 5],
            timeSlots: [
                {
                    departureTime: "09:00",
                    availableSeats: 12
                },
                {
                    departureTime: "13:00",
                    availableSeats: 12
                }
            ]
        },
        includes: [
            "Expert pilot with historical commentary",
            "Gourmet refreshments and lunch pack",
            "WWII history booklet",
            "Professional photography service available",
            "Commemorative flight certificate",
            "Hotel transfers included",
            "Complimentary drink at partner resort"
        ],
        requirements: {
            minimumAge: 8,
            weightLimit: 115,
            healthRestrictions: [
                "Not suitable for pregnant women after first trimester",
                "May not be suitable for severe motion sickness"
            ],
            weatherDependent: true
        },
        cancellationPolicy: {
            freeCancellation: 48,
            refundPercentage: {
                moreThan24Hours: 100,
                lessThan24Hours: 50,
                lessThan12Hours: 25
            }
        },
        rating: 5.0,
        reviewCount: 89,
        totalBookings: 156,
        isActive: true,
        isFeatured: true,
        seasonalAvailability: {
            startMonth: 4,
            endMonth: 11
        },
        safetyInformation: [
            "Multi-engine aircraft for maximum safety",
            "Pilots have extensive experience with island operations",
            "Emergency landing sites identified along route",
            "Satellite communication equipment",
            "Comprehensive safety briefing before departure",
            "Emergency raft and survival equipment onboard"
        ],
        maxBookingsPerDay: 2
    }
];

async function seedScenicTours() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vanuatu-booking');
        console.log('Connected to MongoDB');

        // Clear existing scenic tours
        await ScenicFlyTour.deleteMany({});
        console.log('Cleared existing scenic tours');

        // Insert new scenic tours
        const insertedTours = await ScenicFlyTour.insertMany(scenicTours);
        console.log(`✅ Successfully seeded ${insertedTours.length} scenic fly tours`);

        insertedTours.forEach(tour => {
            console.log(`  - ${tour.name} (${tour.duration} min, ${tour.pricing.perPerson} VUV)`);
        });

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error seeding scenic tours:', error);
        process.exit(1);
    }
}

seedScenicTours();
