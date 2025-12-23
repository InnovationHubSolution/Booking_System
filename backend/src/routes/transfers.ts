import express, { Request, Response } from 'express';
import Transfer from '../models/Transfer';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Search transfers
router.get('/search', async (req: Request, res: Response) => {
    try {
        const {
            type,
            fromLocation,
            toLocation,
            passengers,
            vehicleType,
            maxPrice,
            sortBy = 'price'
        } = req.query;

        let query: any = { isActive: true };

        // Type filter (airport, hotel, port, etc.)
        if (type) {
            query.type = type;
        }

        // Location filters
        if (fromLocation) {
            query['route.from.name'] = new RegExp(fromLocation as string, 'i');
        }
        if (toLocation) {
            query['route.to.name'] = new RegExp(toLocation as string, 'i');
        }

        // Get all matching transfers
        let transfers = await Transfer.find(query);

        // Filter by vehicle availability and capacity
        if (passengers) {
            const passengerCount = parseInt(passengers as string);
            transfers = transfers.filter(transfer =>
                transfer.vehicleOptions.some(vehicle =>
                    vehicle.capacity >= passengerCount && vehicle.available > 0
                )
            );
        }

        // Filter by vehicle type
        if (vehicleType) {
            transfers = transfers.filter(transfer =>
                transfer.vehicleOptions.some(vehicle => vehicle.type === vehicleType)
            );
        }

        // Filter by max price
        if (maxPrice) {
            const maxPriceNum = parseFloat(maxPrice as string);
            transfers = transfers.filter(transfer =>
                transfer.vehicleOptions.some(vehicle => vehicle.price <= maxPriceNum)
            );
        }

        // Sorting
        if (sortBy === 'price') {
            transfers.sort((a, b) => {
                const minPriceA = Math.min(...a.vehicleOptions.map(v => v.price));
                const minPriceB = Math.min(...b.vehicleOptions.map(v => v.price));
                return minPriceA - minPriceB;
            });
        } else if (sortBy === 'duration') {
            transfers.sort((a, b) => a.route.duration - b.route.duration);
        } else if (sortBy === 'rating') {
            transfers.sort((a, b) => b.rating - a.rating);
        }

        res.json(transfers);
    } catch (error: any) {
        res.status(500).json({ message: 'Error searching transfers', error: error.message });
    }
});

// Get transfer by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ message: 'Transfer not found' });
        }
        res.json(transfer);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching transfer', error: error.message });
    }
});

// Get airport transfers
router.get('/type/airport', async (req: Request, res: Response) => {
    try {
        const transfers = await Transfer.find({
            type: 'airport',
            isActive: true
        }).sort({ 'pricing.basePrice': 1 });

        res.json(transfers);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching airport transfers', error: error.message });
    }
});

// Get transfers near location
router.get('/nearby/:lat/:lng', async (req: Request, res: Response) => {
    try {
        const { lat, lng } = req.params;
        const maxDistance = parseInt(req.query.maxDistance as string) || 50000; // 50km default

        const transfers = await Transfer.find({
            isActive: true,
            $or: [
                {
                    'route.from.coordinates': {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [parseFloat(lng), parseFloat(lat)]
                            },
                            $maxDistance: maxDistance
                        }
                    }
                },
                {
                    'route.to.coordinates': {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [parseFloat(lng), parseFloat(lat)]
                            },
                            $maxDistance: maxDistance
                        }
                    }
                }
            ]
        }).limit(20);

        res.json(transfers);
    } catch (error: any) {
        res.status(500).json({ message: 'Error finding nearby transfers', error: error.message });
    }
});

// Get popular routes
router.get('/routes/popular', async (req: Request, res: Response) => {
    try {
        const popularRoutes = await Transfer.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: {
                        from: '$route.from.name',
                        to: '$route.to.name',
                        type: '$type'
                    },
                    count: { $sum: 1 },
                    minPrice: { $min: '$pricing.basePrice' },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json(popularRoutes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching popular routes', error: error.message });
    }
});

// Admin: Create transfer
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const transfer = new Transfer(req.body);
        await transfer.save();
        res.status(201).json(transfer);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating transfer', error: error.message });
    }
});

// Admin: Update transfer
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!transfer) {
            return res.status(404).json({ message: 'Transfer not found' });
        }
        res.json(transfer);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating transfer', error: error.message });
    }
});

// Admin: Delete transfer
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const transfer = await Transfer.findByIdAndDelete(req.params.id);
        if (!transfer) {
            return res.status(404).json({ message: 'Transfer not found' });
        }
        res.json({ message: 'Transfer deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting transfer', error: error.message });
    }
});

export default router;
