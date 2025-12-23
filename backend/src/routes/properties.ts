import express, { Request, Response } from 'express';
import Property from '../models/Property';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Search properties with filters
router.get('/search', async (req: Request, res: Response) => {
    try {
        const {
            destination,
            checkIn,
            checkOut,
            adults,
            children,
            minPrice,
            maxPrice,
            propertyType,
            amenities,
            rating,
            sortBy,
            page = 1,
            limit = 20,
            // New filters
            starRating,
            instantConfirmation,
            freeCancellation,
            mealPlan,
            propertyFeatures,
            guestCapacity,
            bedrooms,
            bathrooms,
            lat,
            lng,
            radius, // in km
            sustainable,
            petFriendly,
            wheelchairAccessible,
            familyFriendly
        } = req.query;

        const query: any = { isActive: true };

        // Location search
        if (destination) {
            query.$or = [
                { 'address.city': new RegExp(destination as string, 'i') },
                { 'address.state': new RegExp(destination as string, 'i') },
                { name: new RegExp(destination as string, 'i') }
            ];
        }

        // Geolocation search (nearby properties)
        if (lat && lng && radius) {
            query['address.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)]
                    },
                    $maxDistance: Number(radius) * 1000 // Convert km to meters
                }
            };
        }

        // Property type filter
        if (propertyType) {
            const types = (propertyType as string).split(',');
            query.propertyType = { $in: types };
        }

        // Star rating filter
        if (starRating) {
            query.starRating = Number(starRating);
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query['rooms.pricePerNight'] = {};
            if (minPrice) query['rooms.pricePerNight'].$gte = Number(minPrice);
            if (maxPrice) query['rooms.pricePerNight'].$lte = Number(maxPrice);
        }

        // Amenities filter
        if (amenities) {
            const amenitiesArray = (amenities as string).split(',');
            query.amenities = { $all: amenitiesArray };
        }

        // Rating filter
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        // Instant confirmation filter
        if (instantConfirmation === 'true') {
            query.instantConfirmation = true;
        }

        // Free cancellation filter
        if (freeCancellation === 'true') {
            query['cancellationPolicy.type'] = { $in: ['flexible', 'moderate'] };
            query['cancellationPolicy.freeCancellationDays'] = { $gte: 1 };
        }

        // Meal plan filter
        if (mealPlan) {
            const mealPlans = (mealPlan as string).split(',');
            query['rooms.mealPlan'] = { $in: mealPlans };
        }

        // Property features filters
        if (propertyFeatures) {
            const features = (propertyFeatures as string).split(',');
            features.forEach(feature => {
                query[`propertyFeatures.${feature}`] = true;
            });
        }

        // Specific feature filters
        if (sustainable === 'true') {
            query['sustainability.certified'] = true;
        }
        if (petFriendly === 'true') {
            query['propertyFeatures.petsAllowed'] = true;
        }
        if (wheelchairAccessible === 'true') {
            query['propertyFeatures.wheelchairAccessible'] = true;
        }
        if (familyFriendly === 'true') {
            query['propertyFeatures.familyFriendly'] = true;
        }

        // Guest capacity filter
        if (guestCapacity) {
            query['rooms.maxGuests'] = { $gte: Number(guestCapacity) };
        }

        // Bedrooms and bathrooms filter
        if (bedrooms) {
            query['rooms.beds'] = { $gte: Number(bedrooms) };
        }
        if (bathrooms) {
            query['rooms.bathrooms'] = { $gte: Number(bathrooms) };
        }

        // Sorting
        let sort: any = {};
        switch (sortBy) {
            case 'price-low':
                sort = { 'rooms.pricePerNight': 1 };
                break;
            case 'price-high':
                sort = { 'rooms.pricePerNight': -1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'popular':
                sort = { reviewCount: -1 };
                break;
            case 'distance':
                // Distance sorting is automatic when using $near
                sort = {};
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { featured: -1, rating: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const properties = await Property.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate('ownerId', 'firstName lastName');

        const total = await Property.countDocuments(query);

        res.json({
            properties,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            },
            filters: {
                applied: {
                    destination,
                    propertyType,
                    starRating,
                    priceRange: { min: minPrice, max: maxPrice },
                    rating,
                    instantConfirmation,
                    freeCancellation,
                    sustainable,
                    petFriendly,
                    wheelchairAccessible,
                    familyFriendly
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get property by ID with details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('ownerId', 'firstName lastName email phone profileImage');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(property);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get featured properties
router.get('/featured/list', async (req: Request, res: Response) => {
    try {
        const properties = await Property.find({ featured: true, isActive: true })
            .limit(10)
            .sort({ rating: -1 });
        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get nearby properties
router.get('/nearby/:lat/:lng', async (req: Request, res: Response) => {
    try {
        const { lat, lng } = req.params;
        const maxDistance = Number(req.query.distance) || 50000; // 50km default

        const properties = await Property.find({
            isActive: true,
            'address.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).limit(20);

        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create new property (host only)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const property = new Property({
            ...req.body,
            ownerId: req.user?.userId
        });

        await property.save();
        res.status(201).json(property);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update property (host/admin only)
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user is owner or admin
        if (property.ownerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Delete property (host/admin only)
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.ownerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get host properties
router.get('/host/my-properties', auth, async (req: AuthRequest, res: Response) => {
    try {
        const properties = await Property.find({ ownerId: req.user?.userId });
        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
