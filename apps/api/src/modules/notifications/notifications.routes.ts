import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from './notifications.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/read-all', authenticateToken, markAllAsRead);

export default router;
