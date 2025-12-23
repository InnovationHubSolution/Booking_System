import express, { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user?.userId })
            .populate('properties');

        if (!wishlist) {
            wishlist = new Wishlist({
                userId: req.user?.userId,
                properties: []
            });
            await wishlist.save();
        }

        res.json(wishlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Add property to wishlist
router.post('/add/:propertyId', auth, async (req: AuthRequest, res: Response) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user?.userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                userId: req.user?.userId,
                properties: []
            });
        }

        const propertyId = req.params.propertyId;

        if (!wishlist.properties.includes(propertyId as any)) {
            wishlist.properties.push(propertyId as any);
            await wishlist.save();
        }

        await wishlist.populate('properties');
        res.json(wishlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Remove property from wishlist
router.delete('/remove/:propertyId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user?.userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.properties = wishlist.properties.filter(
            (id) => id.toString() !== req.params.propertyId
        );

        await wishlist.save();
        await wishlist.populate('properties');
        res.json(wishlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Check if property is in wishlist
router.get('/check/:propertyId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user?.userId });
        const inWishlist = wishlist?.properties.includes(req.params.propertyId as any) || false;
        res.json({ inWishlist });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
