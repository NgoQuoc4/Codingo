import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { createBadRequestError, createUnauthorizedError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'AntigravitySuperSecretDuolingoCodingPlatformSecretKey123';

export const registerUser = async (username?: string, email?: string, password?: string) => {
  if (!username || !email || !password) {
    throw createBadRequestError('All fields are required');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    throw createBadRequestError('Username or Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      xp: 0,
      hearts: 5,
      lastHeartReset: new Date(),
      streak: 0,
      lastActive: new Date()
    }
  });

  // Sign JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  // Remove password from response
  const { password: _, ...userObj } = user;

  return {
    token,
    user: userObj,
  };
};

export const loginUser = async (email?: string, password?: string) => {
  if (!email || !password) {
    throw createBadRequestError('Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createUnauthorizedError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createUnauthorizedError('Invalid credentials');
  }

  // Sign JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...userObj } = user;

  return {
    token,
    user: userObj,
  };
};
