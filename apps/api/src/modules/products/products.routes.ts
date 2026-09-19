import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  uploadImages,
} from './products.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/my/listings', authenticateToken, getMyProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, createProduct);
router.patch('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.post('/upload-images', authenticateToken, upload.array('images', 8), uploadImages);

export default router;
