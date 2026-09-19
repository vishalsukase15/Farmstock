import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });

  res.json({ success: true, data: notifications, unreadCount });
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'Notification marked as read.' });
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'All notifications marked as read.' });
};
