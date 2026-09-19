import { Router } from 'express';
import {
  getUserById,
  updateProfile,
  changePassword,
  getUserAnalytics,
} from './users.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/me/analytics', authenticateToken, getUserAnalytics);
router.patch('/me/profile', authenticateToken, updateProfile);
router.patch('/me/password', authenticateToken, changePassword);
router.get('/:id', getUserById);

export default router;
