import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'AntigravitySuperSecretDuolingoCodingPlatformSecretKey123';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
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
      return res.status(400).json({ message: 'Username or Email already in use' });
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

    return res.status(201).json({
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userObj } = user;

    return res.status(200).json({
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
  }
});

export default router;
