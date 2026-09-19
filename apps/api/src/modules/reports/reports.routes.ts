import { Router } from 'express';
import { createReport, getReports, resolveReport } from './reports.controller.js';
import { authenticateToken, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createReport);
router.get('/admin', authenticateToken, requireAdmin, getReports);
router.patch('/admin/:id', authenticateToken, requireAdmin, resolveReport);

export default router;
