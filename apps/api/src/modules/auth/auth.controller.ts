import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../../config/prisma.js';
import { generateAccessToken, generateRefreshToken } from '../../config/jwt.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const signupSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['FARMER', 'ADMIN']).default('FARMER'),
  state: z.string().optional(),
  district: z.string().optional(),
  taluka: z.string().optional(),
  villageOrCity: z.string().optional(),
  pincode: z.string().optional(),
  preferredLang: z.enum(['en', 'mr', 'hi', 'es']).default('en'),
});

const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  const validated = signupSchema.parse(req.body);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validated.email },
        ...(validated.phone ? [{ phone: validated.phone }] : []),
      ],
    },
  });

  if (existingUser) {
    res.status(400).json({ success: false, message: 'An account with this email or phone number already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(validated.password, 10);

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      phone: validated.phone,
      passwordHash,
      role: validated.role,
      isVerified: true,
      profile: {
        create: {
          fullName: validated.fullName,
          preferredLang: validated.preferredLang,
          state: validated.state,
          district: validated.district,
          taluka: validated.taluka,
          villageOrCity: validated.villageOrCity,
          pincode: validated.pincode,
          isPhonePublic: true,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Farmer account registered successfully!',
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.profile,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
    include: {
      profile: true,
    },
  });

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    return;
  }

  if (user.status === 'SUSPENDED') {
    res.status(403).json({ success: false, message: 'Your account has been suspended by administration. Contact support.' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Welcome back to FarmStock!',
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.profile,
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      profile: true,
      _count: {
        select: {
          products: true,
          purchaseRequestsSent: true,
          purchaseRequestsReceived: true,
          rentalRequestsSent: true,
          rentalRequestsReceived: true,
          cartItems: true,
          wishlist: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      status: user.status,
      profile: user.profile,
      counts: user._count,
    },
  });
};
