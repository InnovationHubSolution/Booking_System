const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/vanuatu-booking')
    .then(async () => {
        console.log('Connected to MongoDB');

        const collections = ['services', 'properties', 'flights', 'carrentals', 'transfers', 'travelpackages'];

        for (const collection of collections) {
            try {
                await mongoose.connection.db.collection(collection).drop();
                console.log(`✅ Dropped ${collection}`);
            } catch (error) {
                console.log(`⚠️ ${collection} not found or already dropped`);
            }
        }

        console.log('✅ All collections cleared successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
