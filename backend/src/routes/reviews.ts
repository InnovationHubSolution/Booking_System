import express, { Request, Response } from 'express';
import Review from '../models/Review';
import Property from '../models/Property';
import Booking from '../models/Booking';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get reviews for a property
router.get('/property/:propertyId', async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, sort = 'recent' } = req.query;

        let sortOption: any = { createdAt: -1 };
        if (sort === 'helpful') {
            sortOption = { 'helpful.length': -1 };
        } else if (sort === 'rating-high') {
            sortOption = { rating: -1 };
        } else if (sort === 'rating-low') {
            sortOption = { rating: 1 };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const reviews = await Review.find({ propertyId: req.params.propertyId })
            .populate('userId', 'firstName lastName profileImage')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Review.countDocuments({ propertyId: req.params.propertyId });

        // Calculate rating breakdown
        const ratingStats = await Review.aggregate([
            { $match: { propertyId: req.params.propertyId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    avgCleanliness: { $avg: '$cleanliness' },
                    avgAccuracy: { $avg: '$accuracy' },
                    avgCheckIn: { $avg: '$checkIn' },
                    avgCommunication: { $avg: '$communication' },
                    avgLocation: { $avg: '$location' },
                    avgValue: { $avg: '$value' },
                    rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            reviews,
            stats: ratingStats[0] || {},
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create a review
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { propertyId, bookingId, rating, cleanliness, accuracy, checkIn, communication, location, value, comment, images } = req.body;

        // Verify booking exists and belongs to user
        const booking = await Booking.findOne({
            _id: bookingId,
            userId: req.user?.userId,
            propertyId,
            status: 'completed'
        });

        if (!booking) {
            return res.status(400).json({ message: 'You can only review completed bookings' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        const review = new Review({
            propertyId,
            userId: req.user?.userId,
            bookingId,
            rating,
            cleanliness,
            accuracy,
            checkIn,
            communication,
            location,
            value,
            comment,
            images: images || []
        });

        await review.save();

        // Update property rating
        const allReviews = await Review.find({ propertyId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Property.findByIdAndUpdate(propertyId, {
            rating: avgRating,
            reviewCount: allReviews.length
        });

        res.status(201).json(review);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req: AuthRequest, res: Response) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const userId = req.user?.userId;
        const index = review.helpful.indexOf(userId as any);

        if (index > -1) {
            // Remove if already marked
            review.helpful.splice(index, 1);
        } else {
            // Add if not marked
            review.helpful.push(userId as any);
        }

        await review.save();
        res.json(review);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Host response to review
router.post('/:id/response', auth, async (req: AuthRequest, res: Response) => {
    try {
        const review = await Review.findById(req.params.id).populate('propertyId');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const property = await Property.findById(review.propertyId);

        if (!property || property.ownerId.toString() !== req.user?.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        review.response = {
            text: req.body.text,
            date: new Date()
        };

        await review.save();
        res.json(review);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
