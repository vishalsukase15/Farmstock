import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
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

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice || 0;
    return sum + price * item.quantity;
  }, 0);

  res.json({
    success: true,
    data: items,
    summary: {
      itemCount: items.length,
      subtotal,
      currency: 'INR',
    },
  });
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { productId, quantity = 1 } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  if (product.ownerId === req.user.id) {
    res.status(400).json({ success: false, message: 'You cannot add your own equipment to cart.' });
    return;
  }

  if (product.status !== 'APPROVED') {
    res.status(400).json({ success: false, message: 'Equipment is currently unavailable.' });
    return;
  }

  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId: req.user.id,
      productId,
      quantity,
    },
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });

  res.json({ success: true, message: 'Added to cart.', data: cartItem });
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
    res.json({ success: true, message: 'Item removed from cart.' });
    return;
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: { product: true },
  });

  res.json({ success: true, data: updated });
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  await prisma.cartItem.deleteMany({
    where: { id, userId: req.user.id },
  });

  res.json({ success: true, message: 'Item removed from cart.' });
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { userId: req.user.id },
  });

  res.json({ success: true, message: 'Cart cleared.' });
};
