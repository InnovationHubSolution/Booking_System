import express from 'express';
import Booking from '../models/Booking';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/backup/cars/:carId
 * Get backup car options for a failed booking
 */
router.get('/cars/:carId', async (req, res) => {
    try {
        const { carId } = req.params;
        const { pickupDate, returnDate, priceRange = '20' } = req.query;

        // Mock backup cars logic - in real app, this would query your cars database
        const backupCars = [
            {
                id: 'backup-1',
                make: 'Hyundai',
                model: 'Accent',
                year: 2023,
                type: 'compact',
                transmission: 'automatic',
                seats: 5,
                luggage: 2,
                fuelType: 'petrol',
                pricePerDay: 4800,
                currency: 'VUV',
                features: ['Air Conditioning', 'Bluetooth', 'Fuel Efficient'],
                images: ['/api/placeholder/400/300'],
                provider: {
                    name: 'Budget Cars Vanuatu',
                    rating: 4.5,
                    reviews: 76,
                    location: 'Port Vila'
                },
                availability: true,
                pickupLocations: ['Port Vila Airport', 'Port Vila Downtown']
            },
            {
                id: 'backup-2',
                make: 'Kia',
                model: 'Picanto',
                year: 2022,
                type: 'compact',
                transmission: 'manual',
                seats: 4,
                luggage: 2,
                fuelType: 'petrol',
                pricePerDay: 4200,
                currency: 'VUV',
                features: ['Air Conditioning', 'Radio', 'Economical'],
                images: ['/api/placeholder/400/300'],
                provider: {
                    name: 'Economy Car Hire',
                    rating: 4.2,
                    reviews: 45,
                    location: 'Port Vila'
                },
                availability: true,
                pickupLocations: ['Port Vila Airport', 'Port Vila Downtown']
            },
            {
                id: 'backup-3',
                make: 'Mazda',
                model: 'CX-3',
                year: 2023,
                type: 'suv',
                transmission: 'automatic',
                seats: 5,
                luggage: 4,
                fuelType: 'petrol',
                pricePerDay: 6500,
                currency: 'VUV',
                features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'All-wheel Drive'],
                images: ['/api/placeholder/400/300'],
                provider: {
                    name: 'Premium Car Rental',
                    rating: 4.8,
                    reviews: 112,
                    location: 'Port Vila'
                },
                availability: true,
                pickupLocations: ['Port Vila Airport', 'Port Vila Downtown', 'Hotel Pickup']
            }
        ];

        res.json(backupCars);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/backup/payment-methods
 * Get recommended backup payment methods based on failed primary method
 */
router.post('/payment-methods', async (req, res) => {
    try {
        const { failedMethod, amount, currency = 'VUV' } = req.body;

        // Recommend backup payment methods based on failed primary method
        const recommendations = getBackupPaymentRecommendations(failedMethod, amount, currency);

        res.json({
            success: true,
            recommendations,
            message: `Found ${recommendations.length} backup payment options`
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/backup/booking-data
 * Save booking data for backup/recovery purposes
 */
router.post('/booking-data', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingData, step, paymentAttempts } = req.body;
        const userId = req.user?.userId;

        // Store backup booking data in session or temporary storage
        // This allows users to recover their booking if something goes wrong
        const backupData = {
            userId,
            bookingData,
            step,
            paymentAttempts,
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        };

        // In production, you'd store this in Redis or a temporary collection
        // For now, we'll just return success
        res.json({
            success: true,
            backupId: `backup-${Date.now()}`,
            expiresAt: backupData.expiresAt
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/backup/booking-data/:backupId
 * Restore booking data from backup
 */
router.get('/booking-data/:backupId', auth, async (req: AuthRequest, res) => {
    try {
        const { backupId } = req.params;

        // In production, retrieve from backup storage
        // For now, return a mock response
        res.json({
            success: false,
            message: 'No backup data found or backup has expired'
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Helper function to get backup payment method recommendations
 */
function getBackupPaymentRecommendations(failedMethod: string, amount: number, currency: string) {
    const recommendations = [];

    switch (failedMethod) {
        case 'credit-card':
        case 'debit-card':
            recommendations.push(
                { method: 'cash', reason: 'No processing fees', reliability: 'high' },
                { method: 'mobile-money', reason: 'Instant transfer', reliability: 'high' },
                { method: 'paypal', reason: 'Alternative online payment', reliability: 'medium' }
            );
            break;
        case 'paypal':
            recommendations.push(
                { method: 'credit-card', reason: 'Direct card payment', reliability: 'high' },
                { method: 'bank-transfer', reason: 'Direct bank payment', reliability: 'high' },
                { method: 'cash', reason: 'Pay at pickup', reliability: 'high' }
            );
            break;
        case 'mobile-money':
            recommendations.push(
                { method: 'cash', reason: 'Pay at counter', reliability: 'high' },
                { method: 'eftpos', reason: 'Local payment system', reliability: 'high' },
                { method: 'credit-card', reason: 'International cards accepted', reliability: 'medium' }
            );
            break;
        default:
            recommendations.push(
                { method: 'cash', reason: 'Most reliable option', reliability: 'high' },
                { method: 'credit-card', reason: 'Widely accepted', reliability: 'high' }
            );
    }

    return recommendations;
}

export default router;