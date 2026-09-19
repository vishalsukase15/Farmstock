import { Router } from 'express';
import {
  getAdminMetrics,
  getAdminUsers,
  toggleUserStatus,
  getAdminProducts,
  moderateProduct,
  getAdminAnalytics,
} from './admin.controller.js';
import { authenticateToken, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/metrics', getAdminMetrics);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/products', getAdminProducts);
router.patch('/products/:id/moderation', moderateProduct);
router.get('/analytics', getAdminAnalytics);

export default router;
