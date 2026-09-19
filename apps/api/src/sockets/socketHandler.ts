import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma.js';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join personal user notification room
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 User joined personal room: user:${userId}`);
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`💬 Socket joined conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Real-time message exchange
    socket.on('send_message', async (data: { conversationId: string; senderId: string; content: string }) => {
      try {
        const { conversationId, senderId, content } = data;
        if (!content || !content.trim()) return;

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId,
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
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Broadcast to everyone in conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', message);

        // Find recipient to notify in their user room
        const participants = await prisma.conversationParticipant.findMany({
          where: {
            conversationId,
            userId: { not: senderId },
          },
        });

        for (const p of participants) {
          io.to(`user:${p.userId}`).emit('message_notification', {
            conversationId,
            senderName: message.sender.profile?.fullName || 'A farmer',
            preview: message.content,
          });
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, userName }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', { conversationId, userName });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', { conversationId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
