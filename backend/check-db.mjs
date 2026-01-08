import mongoose from 'mongoose';
import User from './src/models/User';
import Property from './src/models/Property';

async function checkDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/vanuatu-booking');
        console.log('Connected to MongoDB\n');
        
        const userCount = await User.countDocuments();
        const propertyCount = await Property.countDocuments();
        
        console.log('Current Database Stats:');
        console.log('- Users:', userCount);
        console.log('- Properties:', propertyCount);
        
        const properties = await Property.find().select('name propertyType rating address.city');
        console.log('\nProperties in Database:');
        properties.forEach(p => console.log(    () -  - ));
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
