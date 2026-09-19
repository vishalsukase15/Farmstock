import { Request, Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { productId, rating, comment } = reviewSchema.parse(req.body);

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  if (product.ownerId === req.user.id) {
    res.status(400).json({ success: false, message: 'You cannot review your own equipment.' });
    return;
  }

  const review = await prisma.review.create({
    data: {
      productId,
      authorId: req.user.id,
      targetUserId: product.ownerId,
      rating,
      comment,
    },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  // Notify owner
  await prisma.notification.create({
    data: {
      userId: product.ownerId,
      title: 'New Review Received',
      message: `${review.author.profile?.fullName || 'A buyer'} gave your listing a ${rating}-star review.`,
      type: 'SYSTEM',
      linkUrl: `/products/${productId}`,
    },
  });

  res.status(201).json({ success: true, message: 'Review submitted successfully!', data: review });
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  res.json({ success: true, data: reviews, averageRating: Math.round(avgRating * 10) / 10 });
};
