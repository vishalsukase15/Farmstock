import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
          owner: {
            select: {
              id: true,
              profile: { select: { fullName: true, district: true, state: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: items });
};

export const toggleWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { productId } = req.body;

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });
    res.json({ success: true, isWishlisted: false, message: 'Removed from wishlist.' });
  } else {
    await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId,
      },
    });
    res.json({ success: true, isWishlisted: true, message: 'Added to wishlist.' });
  }
};
