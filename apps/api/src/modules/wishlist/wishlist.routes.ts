import { Router } from 'express';
import { getWishlist, toggleWishlist } from './wishlist.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getWishlist);
router.post('/toggle', authenticateToken, toggleWishlist);

export default router;
