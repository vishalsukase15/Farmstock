import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import requestsRoutes from './modules/requests/requests.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setupSocketHandlers(io);

// Make io accessible from req if needed
app.set('io', io);

// Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving for uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FARMSTOCK API Engine',
    version: '1.0.0',
    currency: 'INR (₹)',
    languages: ['en', 'mr', 'hi', 'es'],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start HTTP + Socket Server
server.listen(PORT, () => {
  console.log(`🌾 ======================================== 🌾`);
  console.log(`🚀 FARMSTOCK Backend Server running on port ${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(`⚡ WebSockets ready with Socket.IO`);
  console.log(`📁 Uploads available at: http://localhost:${PORT}/uploads`);
  console.log(`🌾 ======================================== 🌾`);
});

export default app;
