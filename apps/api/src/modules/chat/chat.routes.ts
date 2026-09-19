import { Router } from 'express';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} from './chat.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);
router.post('/conversations', authenticateToken, startConversation);
router.get('/conversations/:id/messages', authenticateToken, getMessages);
router.post('/conversations/:id/messages', authenticateToken, sendMessage);

export default router;
