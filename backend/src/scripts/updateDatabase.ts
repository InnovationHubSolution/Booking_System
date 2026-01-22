import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Discount from '../models/Discount';
import DiscountUsage from '../models/DiscountUsage';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vanuatu-booking';

async function updateDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update existing users to have isActive field
        console.log('\n📝 Updating existing users with isActive field...');
        const updateUsersResult = await User.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
        );
        console.log(`✅ Updated ${updateUsersResult.modifiedCount} users with isActive field`);

        // Clear existing discounts and discount usage
        console.log('\n🗑️  Clearing existing discounts...');
        await Discount.deleteMany({});
        await DiscountUsage.deleteMany({});
        console.log('✅ Cleared discount data');

        // Create discount codes
        console.log('\n🎫 Creating discount codes...');
        const now = new Date();
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

        const discounts = await Discount.insertMany([
            {
                code: 'WELCOME10',
                description: 'Welcome discount for new customers - 10% off your first booking',
                type: 'percentage',
                value: 10,
                minPurchaseAmount: 50,
                maxDiscountAmount: 100,
                validFrom: now,
                validUntil: sixMonthsFromNow,
                maxUses: 1000,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 1
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'SUMMER25',
                description: 'Summer special - 25% off all bookings',
                type: 'percentage',
                value: 25,
                minPurchaseAmount: 200,
                maxDiscountAmount: 500,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 500,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 3
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'HOTEL50',
                description: '$50 off hotel bookings over $300',
                type: 'fixed',
                value: 50,
                minPurchaseAmount: 300,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 200,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 2
                },
                isActive: true,
                applicableCategories: ['accommodation'],
            },
            {
                code: 'FLIGHT15',
                description: '15% off flight bookings',
                type: 'percentage',
                value: 15,
                minPurchaseAmount: 100,
                maxDiscountAmount: 200,
                validFrom: now,
                validUntil: sixMonthsFromNow,
                maxUses: 300,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 2
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'ADVENTURE20',
                description: '20% off tours and activities',
                type: 'percentage',
                value: 20,
                minPurchaseAmount: 75,
                maxDiscountAmount: 150,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 250,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 5
                },
                isActive: true,
                applicableCategories: ['tour', 'activity'],
            },
            {
                code: 'CARRENTAL30',
                description: '$30 off car rental bookings',
                type: 'fixed',
                value: 30,
                minPurchaseAmount: 150,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 150,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 2
                },
                isActive: true,
                applicableCategories: ['car-rental'],
            },
            {
                code: 'PACKAGE100',
                description: '$100 off vacation packages over $1000',
                type: 'fixed',
                value: 100,
                minPurchaseAmount: 1000,
                validFrom: now,
                validUntil: sixMonthsFromNow,
                maxUses: 100,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 1
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'EARLYBIRD15',
                description: '15% off bookings made 30+ days in advance',
                type: 'percentage',
                value: 15,
                minPurchaseAmount: 150,
                maxDiscountAmount: 300,
                validFrom: now,
                validUntil: sixMonthsFromNow,
                maxUses: 500,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 10
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'WEEKEND20',
                description: '20% off weekend bookings',
                type: 'percentage',
                value: 20,
                minPurchaseAmount: 100,
                maxDiscountAmount: 250,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 400,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 4
                },
                isActive: true,
                applicableCategories: ['accommodation'],
            },
            {
                code: 'LOYALTY30',
                description: '$30 off for returning customers',
                type: 'fixed',
                value: 30,
                minPurchaseAmount: 200,
                validFrom: now,
                validUntil: sixMonthsFromNow,
                maxUses: 1000,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 5
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'FREEDIVE',
                description: 'Free diving experience with package booking',
                type: 'fixed',
                value: 120,
                minPurchaseAmount: 800,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 50,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 1
                },
                isActive: true,
                applicableCategories: ['all'],
            },
            {
                code: 'LASTMINUTE25',
                description: '25% off last minute bookings (within 48 hours)',
                type: 'percentage',
                value: 25,
                minPurchaseAmount: 100,
                maxDiscountAmount: 200,
                validFrom: now,
                validUntil: threeMonthsFromNow,
                maxUses: 200,
                usedCount: 0,
                userRestrictions: {
                    maxUsesPerUser: 3
                },
                isActive: true,
                applicableCategories: ['all'],
            },
        ]);

        console.log(`✅ Created ${discounts.length} discount codes`);

        // Display created discounts
        console.log('\n📋 Created Discount Codes:');
        discounts.forEach(discount => {
            console.log(`   • ${discount.code} - ${discount.description}`);
            if (discount.type === 'percentage') {
                console.log(`     ${discount.value}% off (min: $${discount.minPurchaseAmount}, max discount: $${discount.maxDiscountAmount || 'unlimited'})`);
            } else {
                console.log(`     $${discount.value} off (min: $${discount.minPurchaseAmount})`);
            }
            console.log(`     Valid until: ${discount.validUntil?.toLocaleDateString()}`);
            console.log(`     Categories: ${discount.applicableCategories?.join(', ')}`);
            console.log(`     Per user limit: ${discount.userRestrictions?.maxUsesPerUser}`);
            console.log('');
        });

        // Verify collections exist
        console.log('🔍 Verifying database collections...');
        const db = mongoose.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            const collectionNames = collections.map(c => c.name);

            console.log('\n✅ Available collections:');
            collectionNames.forEach(name => console.log(`   • ${name}`));
        }

        // Get counts
        console.log('\n📊 Database Statistics:');
        const userCount = await User.countDocuments();
        const discountCount = await Discount.countDocuments();
        const activeDiscountCount = await Discount.countDocuments({ isActive: true });

        console.log(`   • Users: ${userCount}`);
        console.log(`   • Discounts: ${discountCount} (${activeDiscountCount} active)`);

        console.log('\n✅ Database update completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Start the backend server: npm run dev');
        console.log('   2. Test discount validation: GET /api/discounts/validate/WELCOME10');
        console.log('   3. View all discounts: GET /api/discounts');
        console.log('   4. Test user routes: GET /api/users/profile (with auth token)');

    } catch (error) {
        console.error('❌ Error updating database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the update
updateDatabase();
