import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export const getAdminMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [
    totalUsers,
    activeFarmers,
    totalListings,
    activeListings,
    pendingListings,
    purchaseRequests,
    rentalRequests,
    openReports,
    categoriesCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE', role: 'FARMER' } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: 'APPROVED' } }),
    prisma.product.count({ where: { status: 'PENDING' } }),
    prisma.purchaseRequest.count(),
    prisma.rentalRequest.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.category.count(),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeFarmers,
      totalListings,
      activeListings,
      pendingListings,
      purchaseRequests,
      rentalRequests,
      openReports,
      categoriesCount,
    },
  });
};

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, status } = req.query;

  const where: any = {};
  if (status) where.status = status as string;
  if (search) {
    const s = search as string;
    where.OR = [
      { email: { contains: s } },
      { phone: { contains: s } },
      { profile: { fullName: { contains: s } } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      profile: true,
      _count: {
        select: {
          products: true,
          purchaseRequestsSent: true,
          rentalRequestsSent: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: users });
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
    include: { profile: true },
  });

  res.json({ success: true, message: `User status changed to ${status}.`, data: updated });
};

export const getAdminProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status } = req.query;

  const products = await prisma.product.findMany({
    where: status ? { status: status as string } : undefined,
    include: {
      category: true,
      images: { take: 1 },
      owner: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: products });
};

export const moderateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, reason } = req.body; // APPROVED or REJECTED

  const product = await prisma.product.update({
    where: { id },
    data: { status },
    include: { owner: true },
  });

  await prisma.notification.create({
    data: {
      userId: product.ownerId,
      title: `Listing Moderation Update: ${status}`,
      message: `Your listing for "${product.name}" has been ${status.toLowerCase()}.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'MODERATION',
      linkUrl: `/products/${product.id}`,
    },
  });

  res.json({ success: true, message: `Listing is now ${status}.`, data: product });
};

export const getAdminAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Category distribution
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
  });

  const categoryDistribution = categories
    .filter((c) => c._count.products > 0)
    .map((c) => ({
      name: c.name,
      listings: c._count.products,
    }));

  // Regional distribution
  const stateAggregates = await prisma.product.groupBy({
    by: ['state'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const regionalDistribution = stateAggregates.map((s) => ({
    state: s.state,
    count: s._count.id,
  }));

  res.json({
    success: true,
    data: {
      categoryDistribution,
      regionalDistribution,
    },
  });
};
