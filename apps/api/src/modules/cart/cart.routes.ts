import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from './cart.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getCart);
router.post('/items', authenticateToken, addToCart);
router.patch('/items/:id', authenticateToken, updateCartItem);
router.delete('/items/:id', authenticateToken, removeFromCart);
router.delete('/', authenticateToken, clearCart);

export default router;
