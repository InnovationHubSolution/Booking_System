import express, { Request, Response } from 'express';
import TravelPackage from '../models/TravelPackage';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Search packages
router.get('/search', async (req: Request, res: Response) => {
    try {
        const {
            destination,
            category,
            minDuration,
            maxDuration,
            maxPrice,
            startDate,
            difficulty,
            includes,
            sortBy = 'featured'
        } = req.query;

        let query: any = { isActive: true };

        // Destination filter
        if (destination) {
            query.destination = new RegExp(destination as string, 'i');
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Duration filter
        if (minDuration || maxDuration) {
            query['duration.days'] = {};
            if (minDuration) query['duration.days'].$gte = parseInt(minDuration as string);
            if (maxDuration) query['duration.days'].$lte = parseInt(maxDuration as string);
        }

        // Price filter
        if (maxPrice) {
            query['pricing.basePrice'] = { $lte: parseFloat(maxPrice as string) };
        }

        // Start date filter
        if (startDate) {
            const searchDate = new Date(startDate as string);
            query['availability.startDate'] = { $lte: searchDate };
            query['availability.endDate'] = { $gte: searchDate };
        }

        // Difficulty filter
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Includes filters (flights, accommodation, etc.)
        if (includes) {
            const includesList = (includes as string).split(',');
            includesList.forEach(item => {
                query[`includes.${item}`] = true;
            });
        }

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        // Sorting
        let sort: any = {};
        switch (sortBy) {
            case 'featured':
                sort = { isFeatured: -1, rating: -1 };
                break;
            case 'price':
                sort = { 'pricing.basePrice': 1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'duration':
                sort = { 'duration.days': 1 };
                break;
            default:
                sort = { isFeatured: -1, rating: -1 };
        }

        const packages = await TravelPackage.find(query)
            .populate('createdBy', 'firstName lastName email')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await TravelPackage.countDocuments(query);

        res.json({
            packages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error searching packages', error: error.message });
    }
});

// Get package by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const package_ = await TravelPackage.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email profileImage');

        if (!package_) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json(package_);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching package', error: error.message });
    }
});

// Get featured packages
router.get('/featured/list', async (req: Request, res: Response) => {
    try {
        const packages = await TravelPackage.find({
            isActive: true,
            isFeatured: true
        })
            .sort({ rating: -1 })
            .limit(8);

        res.json(packages);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching featured packages', error: error.message });
    }
});

// Get packages by category
router.get('/category/:category', async (req: Request, res: Response) => {
    try {
        const packages = await TravelPackage.find({
            isActive: true,
            category: req.params.category
        })
            .sort({ rating: -1 })
            .limit(20);

        res.json(packages);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching packages by category', error: error.message });
    }
});

// Get popular destinations
router.get('/destinations/popular', async (req: Request, res: Response) => {
    try {
        const destinations = await TravelPackage.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$destination',
                    packageCount: { $sum: 1 },
                    minPrice: { $min: '$pricing.basePrice' },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { packageCount: -1 } },
            { $limit: 10 }
        ]);

        res.json(destinations);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching popular destinations', error: error.message });
    }
});

// Create package (admin or authorized users)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const package_ = new TravelPackage({
            ...req.body,
            createdBy: req.user.userId
        });

        await package_.save();
        res.status(201).json(package_);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating package', error: error.message });
    }
});

// Update package
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const package_ = await TravelPackage.findById(req.params.id);
        if (!package_) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Check authorization
        if (package_.createdBy && package_.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this package' });
        }

        const updated = await TravelPackage.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating package', error: error.message });
    }
});

// Delete package
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const package_ = await TravelPackage.findById(req.params.id);
        if (!package_) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Check authorization
        if (package_.createdBy && package_.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this package' });
        }

        await TravelPackage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Package deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting package', error: error.message });
    }
});

// Get user's packages
router.get('/user/my-packages', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const packages = await TravelPackage.find({ createdBy: req.user.userId })
            .sort({ createdAt: -1 });

        res.json(packages);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching user packages', error: error.message });
    }
});

export default router;
