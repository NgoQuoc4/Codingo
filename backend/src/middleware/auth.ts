import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'AntigravitySuperSecretDuolingoCodingPlatformSecretKey123';
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export interface AuthRequest extends Request {
  user?: User;
}

// Function to calculate and save recovered hearts
export async function handleHeartsRecovery(user: User): Promise<User> {
  if (user.hearts < 5) {
    const now = Date.now();
    const lastResetTime = new Date(user.lastHeartReset).getTime();
    const elapsedMs = now - lastResetTime;

    if (elapsedMs >= FOUR_HOURS_MS) {
      const heartsToRecover = Math.floor(elapsedMs / FOUR_HOURS_MS);
      const newHearts = Math.min(5, user.hearts + heartsToRecover);
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          hearts: newHearts,
          lastHeartReset: newHearts === 5 
            ? new Date(now) 
            : new Date(lastResetTime + (heartsToRecover * FOUR_HOURS_MS))
        }
      });
      return updatedUser;
    }
  } else {
    // If hearts are full, keep lastHeartReset aligned to now so it starts clean if they lose a heart
    const now = new Date();
    if (now.getTime() - new Date(user.lastHeartReset).getTime() > FOUR_HOURS_MS) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastHeartReset: now }
      });
      return updatedUser;
    }
  }
  return user;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    let user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Apply heart recovery lazily on every request
    user = await handleHeartsRecovery(user);

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized access', error: (error as Error).message });
  }
}

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
}
