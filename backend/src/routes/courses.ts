import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/courses - Get all theory courses/lessons
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching theory lessons', error: (error as Error).message });
  }
});

export default router;
