import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const createReportSchema = z.object({
  targetType: z.enum(['PRODUCT', 'USER']),
  targetId: z.string().min(1),
  reason: z.string().min(2, 'Reason is required'),
  description: z.string().optional(),
});

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const validated = createReportSchema.parse(req.body);

  const report = await prisma.report.create({
    data: {
      reporterId: req.user.id,
      targetType: validated.targetType,
      targetId: validated.targetId,
      reason: validated.reason,
      description: validated.description,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted. Our moderation team will investigate.',
    data: report,
  });
};

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: reports });
};

export const resolveReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const report = await prisma.report.update({
    where: { id },
    data: {
      status,
      resolvedAt: new Date(),
    },
  });

  res.json({ success: true, message: 'Report resolved.', data: report });
};
