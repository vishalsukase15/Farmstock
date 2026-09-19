import { Request, Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().optional(),
  modelYear: z.number().int().min(1970).max(new Date().getFullYear() + 1).optional(),
  description: z.string().min(10, 'Detailed description is required'),
  condition: z.enum(['NEW', 'USED', 'REFURBISHED']).default('USED'),
  transactionType: z.enum(['SALE', 'RENT', 'BOTH']).default('SALE'),

  salePrice: z.number().nonnegative().optional(),
  isNegotiable: z.boolean().default(true),
  rentalHourlyRate: z.number().nonnegative().optional(),
  rentalDailyRate: z.number().nonnegative().optional(),
  rentalWeeklyRate: z.number().nonnegative().optional(),
  rentalMonthlyRate: z.number().nonnegative().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  rentalTerms: z.string().optional(),

  usageHours: z.number().int().nonnegative().optional(),
  horsepower: z.number().int().positive().optional(),
  fuelType: z.string().optional(),

  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  taluka: z.string().optional(),
  villageOrCity: z.string().min(2, 'Village or City is required'),
  pincode: z.string().optional(),

  images: z.array(z.string()).min(1, 'At least one product image is required'),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    category,
    condition,
    transactionType,
    minPrice,
    maxPrice,
    state,
    district,
    brand,
    search,
    sort = 'newest',
    page = '1',
    limit = '12',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const take = Math.max(1, parseInt(limit as string, 10) || 12);
  const skip = (pageNum - 1) * take;

  const where: any = {
    status: 'APPROVED',
  };

  if (category) {
    where.category = { slug: category as string };
  }

  if (condition) {
    where.condition = condition as string;
  }

  if (transactionType && transactionType !== 'ALL') {
    where.OR = [
      { transactionType: transactionType as string },
      { transactionType: 'BOTH' },
    ];
  }

  if (state) {
    where.state = { equals: state as string };
  }

  if (district) {
    where.district = { equals: district as string };
  }

  if (brand) {
    where.brand = { equals: brand as string };
  }

  if (minPrice || maxPrice) {
    const min = minPrice ? parseFloat(minPrice as string) : 0;
    const max = maxPrice ? parseFloat(maxPrice as string) : 100000000;
    where.OR = [
      { salePrice: { gte: min, lte: max } },
      { rentalDailyRate: { gte: min, lte: max } },
    ];
  }

  if (search) {
    const term = (search as string).trim();
    where.AND = [
      {
        OR: [
          { name: { contains: term } },
          { description: { contains: term } },
          { brand: { contains: term } },
          { model: { contains: term } },
          { villageOrCity: { contains: term } },
          { district: { contains: term } },
        ],
      },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { salePrice: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { salePrice: 'desc' };
  } else if (sort === 'popular') {
    orderBy = { viewCount: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        owner: {
          select: {
            id: true,
            isVerified: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                district: true,
                state: true,
              },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    take: 6,
    orderBy: { viewCount: 'desc' },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      owner: {
        select: {
          id: true,
          isVerified: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
              district: true,
              state: true,
            },
          },
        },
      },
    },
  });

  res.json({ success: true, data: products });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      specifications: true,
      availabilities: {
        where: { endDate: { gte: new Date() } },
      },
      owner: {
        select: {
          id: true,
          phone: true,
          email: true,
          isVerified: true,
          createdAt: true,
          profile: true,
          _count: {
            select: {
              products: { where: { status: 'APPROVED' } },
              reviewsReceived: true,
            },
          },
        },
      },
      reviews: {
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  // Increment view count asynchronously
  await prisma.product.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  res.json({ success: true, data: product });
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const validated = createProductSchema.parse(req.body);

  const product = await prisma.product.create({
    data: {
      ownerId: req.user.id,
      categoryId: validated.categoryId,
      name: validated.name,
      brand: validated.brand,
      model: validated.model,
      modelYear: validated.modelYear,
      description: validated.description,
      condition: validated.condition,
      transactionType: validated.transactionType,
      salePrice: validated.salePrice,
      isNegotiable: validated.isNegotiable,
      rentalHourlyRate: validated.rentalHourlyRate,
      rentalDailyRate: validated.rentalDailyRate,
      rentalWeeklyRate: validated.rentalWeeklyRate,
      rentalMonthlyRate: validated.rentalMonthlyRate,
      securityDeposit: validated.securityDeposit,
      rentalTerms: validated.rentalTerms,
      usageHours: validated.usageHours,
      horsepower: validated.horsepower,
      fuelType: validated.fuelType,
      state: validated.state,
      district: validated.district,
      taluka: validated.taluka,
      villageOrCity: validated.villageOrCity,
      pincode: validated.pincode,
      status: 'APPROVED', // Auto-approved for verified farmers in prototype
      images: {
        create: validated.images.map((url, idx) => ({
          url,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      },
      specifications: validated.specifications ? {
        create: validated.specifications.map((spec) => ({
          label: spec.label,
          value: spec.value,
        })),
      } : undefined,
    },
    include: {
      images: true,
      category: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Equipment listed on FarmStock successfully!',
    data: product,
  });
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Unauthorized to update this listing.' });
    return;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: req.body,
    include: { images: true, category: true },
  });

  res.json({ success: true, message: 'Listing updated successfully.', data: updated });
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Unauthorized to delete this listing.' });
    return;
  }

  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: 'Listing deleted successfully.' });
};

export const getMyProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const products = await prisma.product.findMany({
    where: { ownerId: req.user.id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      _count: {
        select: {
          purchaseRequests: true,
          rentalRequests: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: products });
};

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: 'No images provided.' });
    return;
  }

  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.json({
    success: true,
    message: `${files.length} images uploaded successfully.`,
    urls,
  });
};
