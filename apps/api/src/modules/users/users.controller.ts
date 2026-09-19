import { Request, Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      profile: true,
      products: {
        where: { status: 'APPROVED' },
        include: {
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      reviewsReceived: {
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  // Mask phone if not public
  const isPhonePublic = user.profile?.isPhonePublic ?? false;
  const safePhone = isPhonePublic ? user.phone : null;

  res.json({
    success: true,
    data: {
      ...user,
      phone: safePhone,
    },
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const {
    fullName,
    avatarUrl,
    bio,
    preferredLang,
    state,
    district,
    taluka,
    villageOrCity,
    pincode,
    isPhonePublic,
  } = req.body;

  const updated = await prisma.userProfile.upsert({
    where: { userId: req.user.id },
    update: {
      fullName,
      avatarUrl,
      bio,
      preferredLang,
      state,
      district,
      taluka,
      villageOrCity,
      pincode,
      isPhonePublic,
    },
    create: {
      userId: req.user.id,
      fullName: fullName || 'Farmer',
      avatarUrl,
      bio,
      preferredLang: preferredLang || 'en',
      state,
      district,
      taluka,
      villageOrCity,
      pincode,
      isPhonePublic: isPhonePublic || false,
    },
  });

  res.json({ success: true, message: 'Profile updated successfully.', data: updated });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Valid passwords required (min 6 chars).' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Incorrect current password.' });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash },
  });

  res.json({ success: true, message: 'Password changed successfully.' });
};

export const getUserAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const products = await prisma.product.findMany({
    where: { ownerId: req.user.id },
    select: {
      id: true,
      name: true,
      viewCount: true,
      status: true,
      salePrice: true,
      rentalDailyRate: true,
      _count: {
        select: {
          purchaseRequests: true,
          rentalRequests: true,
        },
      },
    },
  });

  const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
  const totalInquiries = products.reduce(
    (sum, p) => sum + p._count.purchaseRequests + p._count.rentalRequests,
    0
  );

  res.json({
    success: true,
    data: {
      totalListings: products.length,
      totalViews,
      totalInquiries,
      products,
    },
  });
};
