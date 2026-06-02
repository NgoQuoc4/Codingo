import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/practices - Get all practices (requires auth to attach user progress)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const practices = await prisma.practice.findMany({
      select: {
        id: true,
        title: true,
        language: true,
        description: true,
        chapters: true,
      }
    });
    
    // Find user progress list
    const progressList = await prisma.progress.findMany({
      where: { userId: req.user?.id }
    });

    const practicesWithProgress = practices.map((practice) => {
      const progress = progressList.find((p) => p.practiceId === practice.id);
      const totalLessons = practice.chapters.reduce(
        (acc, chapter) => acc + chapter.lessons.length,
        0
      );
      const completedCount = progress ? progress.completedLessons.length : 0;

      return {
        _id: practice.id, // Keep _id to avoid breaking frontend property names!
        title: practice.title,
        language: practice.language,
        description: practice.description,
        totalLessons,
        completedLessonsCount: completedCount,
        progress: progress || null,
      };
    });

    return res.json(practicesWithProgress);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching practices', error: (error as Error).message });
  }
});

// GET /api/practices/:id - Get specific practice details and user progress
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const practice = await prisma.practice.findUnique({
      where: { id: req.params.id }
    });
    if (!practice) {
      return res.status(404).json({ message: 'Practice not found' });
    }

    // Find progress
    let progress = await prisma.progress.findUnique({
      where: {
        userId_practiceId: {
          userId: req.user?.id || '',
          practiceId: practice.id
        }
      }
    });

    // If no progress document exists, initialize one
    if (!progress && req.user) {
      progress = await prisma.progress.create({
        data: {
          userId: req.user.id,
          practiceId: practice.id,
          completedLessons: [],
          currentLessonId: practice.chapters[0]?.lessons[0]?.id || null,
        }
      });
    }

    // Map `id` to `_id` for backward compatibility with frontend code
    const mappedPractice = {
      ...practice,
      _id: practice.id,
      chapters: practice.chapters.map(c => ({
        ...c,
        _id: c.id,
        lessons: c.lessons.map(l => ({
          ...l,
          _id: l.id
        }))
      }))
    };

    return res.json({
      course: mappedPractice, // Keep key name 'course' so frontend page.tsx doesn't break!
      progress,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching practice details', error: (error as Error).message });
  }
});

export default router;
