import express, { Request, Response } from 'express';
import CarRental from '../models/CarRental';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Search car rentals
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      location,
      pickupDate,
      dropoffDate,
      category,
      transmission,
      minSeats,
      maxPrice,
      sortBy = 'price'
    } = req.query;

    let query: any = { isActive: true };

    // Category filter
    if (category) {
      query['vehicle.category'] = category;
    }

    // Transmission filter
    if (transmission) {
      query['vehicle.transmission'] = transmission;
    }

    // Seats filter
    if (minSeats) {
      query['vehicle.seats'] = { $gte: parseInt(minSeats as string) };
    }

    // Price filter
    if (maxPrice) {
      query['pricing.dailyRate'] = { $lte: parseFloat(maxPrice as string) };
    }

    // Check availability
    query.available = { $gt: 0 };

    // Sorting
    let sort: any = {};
    switch (sortBy) {
      case 'price':
        sort['pricing.dailyRate'] = 1;
        break;
      case 'rating':
        sort.rating = -1;
        break;
      case 'category':
        sort['vehicle.category'] = 1;
        break;
      default:
        sort['pricing.dailyRate'] = 1;
    }

    const cars = await CarRental.find(query).sort(sort);

    // Calculate total price if dates provided
    if (pickupDate && dropoffDate) {
      const pickup = new Date(pickupDate as string);
      const dropoff = new Date(dropoffDate as string);
      const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));

      const carsWithTotal = cars.map(car => {
        const carObj = car.toObject();
        let totalPrice = car.pricing.dailyRate * days;
        
        // Apply weekly/monthly rates if applicable
        if (days >= 30 && car.pricing.monthlyRate) {
          totalPrice = car.pricing.monthlyRate;
        } else if (days >= 7 && car.pricing.weeklyRate) {
          const weeks = Math.floor(days / 7);
          const remainingDays = days % 7;
          totalPrice = (weeks * car.pricing.weeklyRate) + (remainingDays * car.pricing.dailyRate);
        }

        return {
          ...carObj,
          rentalDuration: { days },
          totalPrice,
          averageDailyRate: totalPrice / days
        };
      });

      return res.json(carsWithTotal);
    }

    res.json(cars);
  } catch (error: any) {
    res.status(500).json({ message: 'Error searching car rentals', error: error.message });
  }
});

// Get car rental by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const car = await CarRental.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car rental not found' });
    }
    res.json(car);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching car rental', error: error.message });
  }
});

// Get car rentals near location
router.get('/nearby/:lat/:lng', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.params;
    const maxDistance = parseInt(req.query.maxDistance as string) || 50000; // 50km default

    const cars = await CarRental.find({
      isActive: true,
      'location.pickupLocations.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistance
        }
      }
    }).limit(20);

    res.json(cars);
  } catch (error: any) {
    res.status(500).json({ message: 'Error finding nearby car rentals', error: error.message });
  }
});

// Get popular car categories
router.get('/categories/popular', async (req: Request, res: Response) => {
  try {
    const categories = await CarRental.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$vehicle.category',
          count: { $sum: 1 },
          minPrice: { $min: '$pricing.dailyRate' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Admin: Create car rental
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const car = new CarRental(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating car rental', error: error.message });
  }
});

// Admin: Update car rental
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const car = await CarRental.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) {
      return res.status(404).json({ message: 'Car rental not found' });
    }
    res.json(car);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating car rental', error: error.message });
  }
});

// Admin: Delete car rental
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const car = await CarRental.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car rental not found' });
    }
    res.json({ message: 'Car rental deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting car rental', error: error.message });
  }
});

export default router;
