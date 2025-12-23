import express from 'express';
import Service from '../models/Service';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req: AuthRequest, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const service = new Service(req.body);
        await service.save();

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
