import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const createRentalSchema = z.object({
  productId: z.string().min(1),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  pricingUnit: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  intendedUse: z.string().optional(),
  deliveryPreference: z.enum(['PICKUP', 'DELIVERY']).default('PICKUP'),
  message: z.string().optional(),
});

export const createRentalRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const validated = createRentalSchema.parse(req.body);
  const start = new Date(validated.startDate);
  const end = new Date(validated.endDate);

  if (start >= end) {
    res.status(400).json({
      success: false,
      message: 'Rental end date must be strictly after start date.',
    });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: validated.productId },
    include: { availabilities: true },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Equipment not found' });
    return;
  }

  if (product.ownerId === req.user.id) {
    res.status(400).json({
      success: false,
      message: 'You cannot rent your own equipment.',
    });
    return;
  }

  // Check collision with existing blocked periods or approved bookings
  const conflictingBooking = await prisma.rentalRequest.findFirst({
    where: {
      productId: validated.productId,
      status: { in: ['APPROVED', 'ACTIVE'] },
      AND: [
        { startDate: { lte: end } },
        { endDate: { gte: start } },
      ],
    },
  });

  if (conflictingBooking) {
    res.status(409).json({
      success: false,
      message: 'This equipment is already reserved for the selected dates. Please pick alternative dates.',
    });
    return;
  }

  // Calculate estimated amount based on unit
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  let unitRate = product.rentalDailyRate || 1000;
  let estimatedAmount = diffDays * unitRate;

  if (validated.pricingUnit === 'WEEKLY' && product.rentalWeeklyRate) {
    const weeks = Math.ceil(diffDays / 7);
    estimatedAmount = weeks * product.rentalWeeklyRate;
  } else if (validated.pricingUnit === 'MONTHLY' && product.rentalMonthlyRate) {
    const months = Math.ceil(diffDays / 30);
    estimatedAmount = months * product.rentalMonthlyRate;
  }

  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      productId: validated.productId,
      renterId: req.user.id,
      ownerId: product.ownerId,
      startDate: start,
      endDate: end,
      pricingUnit: validated.pricingUnit,
      estimatedAmount,
      securityDeposit: product.securityDeposit || 0,
      intendedUse: validated.intendedUse,
      deliveryPreference: validated.deliveryPreference,
      message: validated.message,
      status: 'REQUESTED',
    },
    include: {
      product: { select: { name: true } },
      renter: { select: { profile: { select: { fullName: true } } } },
    },
  });

  // Notify owner
  await prisma.notification.create({
    data: {
      userId: product.ownerId,
      title: 'New Rental Request Received',
      message: `${rentalRequest.renter.profile?.fullName || 'A farmer'} requested to rent your ${product.name} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
      type: 'REQUEST',
      linkUrl: '/requests/received',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Rental booking request submitted to owner successfully!',
    data: rentalRequest,
  });
};

export const getSentRentalRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const requests = await prisma.rentalRequest.findMany({
    where: { renterId: req.user.id },
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

export const getReceivedRentalRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const requests = await prisma.rentalRequest.findMany({
    where: { ownerId: req.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
      },
      renter: {
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

export const updateRentalRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!request) {
    res.status(404).json({ success: false, message: 'Rental request not found' });
    return;
  }

  const isOwner = request.ownerId === req.user.id;
  const isRenter = request.renterId === req.user.id;

  if (!isOwner && !isRenter && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Unauthorized action.' });
    return;
  }

  // Update status
  const updated = await prisma.rentalRequest.update({
    where: { id },
    data: { status },
  });

  // If approved, reserve dates in calendar
  if (status === 'APPROVED') {
    await prisma.rentalAvailability.create({
      data: {
        productId: request.productId,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: 'RENTED',
      },
    });
  }

  // Notify counterparty
  const notifyUserId = isOwner ? request.renterId : request.ownerId;
  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      title: `Rental Request ${status}`,
      message: `Your rental booking for ${request.product.name} is now ${status}.`,
      type: 'REQUEST',
      linkUrl: isOwner ? '/requests/sent' : '/requests/received',
    },
  });

  res.json({
    success: true,
    message: `Rental request status updated to ${status}.`,
    data: updated,
  });
};
