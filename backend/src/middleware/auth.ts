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

// Hàm kiểm tra và reset streak về 0 nếu người dùng bỏ học > 1 ngày
// Được gọi lazy trên mỗi request (tương tự handleHeartsRecovery)
export async function handleStreakReset(user: User): Promise<User> {
  if (user.streak > 0) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActiveDay = new Date(
      user.lastActive.getFullYear(),
      user.lastActive.getMonth(),
      user.lastActive.getDate()
    );
    const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

    // Nếu bỏ học > 1 ngày (ít nhất 1 ngày trôi qua không hoạt động) -> Reset streak về 0
    if (diffDays > 1) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { streak: 0 }
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

    // Reset streak về 0 nếu người dùng không học quá 1 ngày
    user = await handleStreakReset(user);

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
