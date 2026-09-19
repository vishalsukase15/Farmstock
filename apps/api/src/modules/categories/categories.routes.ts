import { Router } from 'express';
import { getCategories, createCategory, updateCategory } from './categories.controller.js';
import { authenticateToken, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireAdmin, createCategory);
router.patch('/:id', authenticateToken, requireAdmin, updateCategory);

export default router;
