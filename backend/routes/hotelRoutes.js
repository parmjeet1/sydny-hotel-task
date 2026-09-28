import express from 'express';
import { getHotels, getHotelReviews } from '../controllers/hotelController.js';

const router = express.Router();

// GET /api/hotels -> List all tracked properties
router.get('/', getHotels);

// GET /api/hotels/:id/reviews -> Get reviews for specific hotel with filters & search
router.get('/:id/reviews', getHotelReviews);

export default router;
