import { Router } from 'express';
import {
  createPurchaseRequest,
  getSentPurchaseRequests,
  getReceivedPurchaseRequests,
  updatePurchaseRequestStatus,
} from './purchaseRequests.controller.js';
import {
  createRentalRequest,
  getSentRentalRequests,
  getReceivedRentalRequests,
  updateRentalRequestStatus,
} from './rentalRequests.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

// Purchase routes
router.post('/purchase', authenticateToken, createPurchaseRequest);
router.get('/purchase/sent', authenticateToken, getSentPurchaseRequests);
router.get('/purchase/received', authenticateToken, getReceivedPurchaseRequests);
router.patch('/purchase/:id/status', authenticateToken, updatePurchaseRequestStatus);

// Rental routes
router.post('/rental', authenticateToken, createRentalRequest);
router.get('/rental/sent', authenticateToken, getSentRentalRequests);
router.get('/rental/received', authenticateToken, getReceivedRentalRequests);
router.patch('/rental/:id/status', authenticateToken, updateRentalRequestStatus);

export default router;
