import { Router } from 'express';
import { createReview, getProductReviews } from './reviews.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createReview);
router.get('/product/:productId', getProductReviews);

export default router;
