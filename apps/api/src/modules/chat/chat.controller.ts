import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: req.user.id },
    include: {
      conversation: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              salePrice: true,
              rentalDailyRate: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  profile: { select: { fullName: true, avatarUrl: true } },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  });

  const formatted = participants.map((p) => {
    const conv = p.conversation;
    const otherParticipant = conv.participants.find(
      (part) => part.userId !== req.user!.id
    )?.user;
    const lastMsg = conv.messages[0] || null;

    return {
      id: conv.id,
      productId: conv.productId,
      product: conv.product,
      participant: otherParticipant || null,
      lastMessage: lastMsg,
      updatedAt: conv.updatedAt,
    };
  });

  res.json({ success: true, data: formatted });
};

export const startConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { recipientId, productId } = req.body;

  if (recipientId === req.user.id) {
    res.status(400).json({ success: false, message: 'Cannot start conversation with yourself.' });
    return;
  }

  // Check if conversation already exists between these 2 users
  const existingConv = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: req.user.id } } },
        { participants: { some: { userId: recipientId } } },
        ...(productId ? [{ productId }] : []),
      ],
    },
    include: {
      product: true,
      participants: {
        include: { user: { include: { profile: true } } },
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (existingConv) {
    res.json({ success: true, data: existingConv });
    return;
  }

  // Create new conversation
  const newConv = await prisma.conversation.create({
    data: {
      productId,
      participants: {
        create: [
          { userId: req.user.id },
          { userId: recipientId },
        ],
      },
    },
    include: {
      product: true,
      participants: {
        include: { user: { include: { profile: true } } },
      },
      messages: true,
    },
  });

  res.status(201).json({ success: true, data: newConv });
};

export const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  // Verify participation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: id,
        userId: req.user.id,
      },
    },
  });

  if (!participant && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Unauthorized access to this conversation.' });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sender: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: req.user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json({ success: true, data: messages });
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (!content || !content.trim()) {
    res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    return;
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: req.user.id,
      content: content.trim(),
    },
    include: {
      sender: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({ success: true, data: message });
};
