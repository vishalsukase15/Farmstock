import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const createPurchaseSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  offeredPrice: z.number().positive('Offered price must be greater than 0'),
  message: z.string().optional(),
  preferredContact: z.enum(['CHAT', 'PHONE']).default('CHAT'),
});

export const createPurchaseRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { productId, quantity, offeredPrice, message, preferredContact } =
    createPurchaseSchema.parse(req.body);

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  if (product.ownerId === req.user.id) {
    res.status(400).json({
      success: false,
      message: 'You cannot send a purchase request for your own equipment.',
    });
    return;
  }

  if (product.status !== 'APPROVED') {
    res.status(400).json({
      success: false,
      message: 'This equipment is currently not available for purchase.',
    });
    return;
  }

  const request = await prisma.purchaseRequest.create({
    data: {
      productId,
      buyerId: req.user.id,
      ownerId: product.ownerId,
      quantity,
      offeredPrice,
      message,
      preferredContact,
      status: 'PENDING',
    },
    include: {
      product: { select: { name: true, salePrice: true } },
      buyer: { select: { profile: { select: { fullName: true } } } },
    },
  });

  // Create in-app notification for owner
  await prisma.notification.create({
    data: {
      userId: product.ownerId,
      title: 'New Purchase Offer Received',
      message: `${request.buyer.profile?.fullName || 'A buyer'} submitted an offer of ₹${offeredPrice.toLocaleString('en-IN')} for your ${product.name}.`,
      type: 'REQUEST',
      linkUrl: '/requests/received',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Purchase offer sent to owner successfully!',
    data: request,
  });
};

export const getSentPurchaseRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const requests = await prisma.purchaseRequest.findMany({
    where: { buyerId: req.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
      },
      owner: {
        select: {
          id: true,
          phone: true,
          profile: { select: { fullName: true, avatarUrl: true, district: true, state: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: requests });
};

export const getReceivedPurchaseRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const requests = await prisma.purchaseRequest.findMany({
    where: { ownerId: req.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
      },
      buyer: {
        select: {
          id: true,
          phone: true,
          profile: { select: { fullName: true, avatarUrl: true, district: true, state: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: requests });
};

export const updatePurchaseRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!request) {
    res.status(404).json({ success: false, message: 'Request not found' });
    return;
  }

  const isOwner = request.ownerId === req.user.id;
  const isBuyer = request.buyerId === req.user.id;

  if (!isOwner && !isBuyer && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Unauthorized action.' });
    return;
  }

  // State transitions rules
  if (isBuyer && status !== 'CANCELLED') {
    res.status(400).json({ success: false, message: 'Buyers can only cancel pending requests.' });
    return;
  }

  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: { status },
    include: {
      product: true,
      buyer: { select: { profile: { select: { fullName: true } } } },
      owner: { select: { profile: { select: { fullName: true } } } },
    },
  });

  // Notify counter-party
  const notifyUserId = isOwner ? request.buyerId : request.ownerId;
  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      title: `Purchase Offer ${status}`,
      message: `Your purchase request for ${request.product.name} has been marked as ${status}.`,
      type: 'REQUEST',
      linkUrl: isOwner ? '/requests/sent' : '/requests/received',
    },
  });

  res.json({
    success: true,
    message: `Request status updated to ${status}.`,
    data: updated,
  });
};
