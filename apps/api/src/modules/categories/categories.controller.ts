import { Request, Response } from 'express';
import prisma from '../../config/prisma.js';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          products: {
            where: { status: 'APPROVED' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      productCount: cat._count.products,
    })),
  });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, slug, icon, description } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: icon || 'Wrench',
      description,
    },
  });

  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, icon, description, isActive } = req.body;

  const category = await prisma.category.update({
    where: { id },
    data: { name, icon, description, isActive },
  });

  res.json({ success: true, data: category });
};
