import express from 'express';
import ScenicFlyTour from '../models/ScenicFlyTour';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/scenic-tours:
 *   get:
 *     summary: Get all scenic fly tours
 *     tags: [Scenic Fly Tours]
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured tours
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: duration
 *         schema:
 *           type: number
 *         description: Filter by duration in minutes
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, duration, popular]
 *         description: Sort results by field
 *     responses:
 *       200:
 *         description: List of scenic fly tours
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const {
            featured,
            minPrice,
            maxPrice,
            duration,
            sortBy = 'rating'
        } = req.query;

        let query: any = { isActive: true };

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (minPrice || maxPrice) {
            query['pricing.perPerson'] = {};
            if (minPrice) query['pricing.perPerson'].$gte = Number(minPrice);
            if (maxPrice) query['pricing.perPerson'].$lte = Number(maxPrice);
        }

        if (duration) {
            query.duration = Number(duration);
        }

        let sortOption: any = {};
        switch (sortBy) {
            case 'price':
                sortOption = { 'pricing.perPerson': 1 };
                break;
            case 'rating':
                sortOption = { rating: -1, reviewCount: -1 };
                break;
            case 'duration':
                sortOption = { duration: 1 };
                break;
            case 'popular':
                sortOption = { totalBookings: -1, rating: -1 };
                break;
            default:
                sortOption = { rating: -1 };
        }

        const tours = await ScenicFlyTour.find(query).sort(sortOption);
        res.json(tours);
    } catch (error) {
        console.error('Error fetching scenic fly tours:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /api/scenic-tours/{id}:
 *   get:
 *     summary: Get a specific scenic fly tour
 *     tags: [Scenic Fly Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Scenic fly tour details
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const tour = await ScenicFlyTour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: 'Scenic fly tour not found' });
        }
        res.json(tour);
    } catch (error) {
        console.error('Error fetching scenic fly tour:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /api/scenic-tours/{id}/availability:
 *   get:
 *     summary: Check availability for a specific date
 *     tags: [Scenic Fly Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability
 *     responses:
 *       200:
 *         description: Available time slots
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Server error
 */
router.get('/:id/availability', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        const tour = await ScenicFlyTour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: 'Scenic fly tour not found' });
        }

        const requestedDate = new Date(date as string);
        const dayOfWeek = requestedDate.getDay();

        // Check if tour is available on this day of week
        if (!tour.schedule.availableDays.includes(dayOfWeek)) {
            return res.json({
                available: false,
                reason: 'Tour not available on this day of the week',
                availableDays: tour.schedule.availableDays
            });
        }

        // Check seasonal availability if specified
        if (tour.seasonalAvailability) {
            const month = requestedDate.getMonth() + 1;
            const { startMonth, endMonth } = tour.seasonalAvailability;

            let isInSeason = false;
            if (startMonth <= endMonth) {
                isInSeason = month >= startMonth && month <= endMonth;
            } else {
                // Season spans across year end
                isInSeason = month >= startMonth || month <= endMonth;
            }

            if (!isInSeason) {
                return res.json({
                    available: false,
                    reason: 'Tour not available in this season',
                    seasonalAvailability: tour.seasonalAvailability
                });
            }
        }

        res.json({
            available: true,
            timeSlots: tour.schedule.timeSlots,
            weatherDependent: tour.requirements.weatherDependent
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /api/scenic-tours:
 *   post:
 *     summary: Create a new scenic fly tour (Admin only)
 *     tags: [Scenic Fly Tours]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tour created successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post('/', auth, async (req: AuthRequest, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const tour = new ScenicFlyTour(req.body);
        await tour.save();

        res.status(201).json(tour);
    } catch (error) {
        console.error('Error creating scenic fly tour:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /api/scenic-tours/{id}:
 *   put:
 *     summary: Update a scenic fly tour (Admin only)
 *     tags: [Scenic Fly Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Tour updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, async (req: AuthRequest, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const tour = await ScenicFlyTour.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!tour) {
            return res.status(404).json({ message: 'Scenic fly tour not found' });
        }

        res.json(tour);
    } catch (error) {
        console.error('Error updating scenic fly tour:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /api/scenic-tours/{id}:
 *   delete:
 *     summary: Delete a scenic fly tour (Admin only)
 *     tags: [Scenic Fly Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Tour deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Tour not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, async (req: AuthRequest, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const tour = await ScenicFlyTour.findByIdAndDelete(req.params.id);

        if (!tour) {
            return res.status(404).json({ message: 'Scenic fly tour not found' });
        }

        res.json({ message: 'Scenic fly tour deleted successfully' });
    } catch (error) {
        console.error('Error deleting scenic fly tour:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
