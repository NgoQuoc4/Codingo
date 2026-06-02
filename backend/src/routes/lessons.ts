import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/lessons/:id - Get lesson exercises
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = req.params.id;

    // Load practices to programmatically search the embedded chapters/lessons
    const practices = await prisma.practice.findMany();
    let lessonMatch = null;

    for (const practice of practices) {
      for (const chapter of practice.chapters) {
        const match = chapter.lessons.find((l) => l.id === lessonId);
        if (match) {
          lessonMatch = match;
          break;
        }
      }
      if (lessonMatch) break;
    }

    if (!lessonMatch) {
      return res.status(404).json({ message: 'Lesson details not found' });
    }

    return res.json(lessonMatch);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching lesson details', error: (error as Error).message });
  }
});

// POST /api/lessons/:id/complete - Complete lesson, earn XP, update streak and progress
router.post('/:id/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonIdStr = req.params.id;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User context not found' });
    }

    // Find practice containing the completed lesson
    const practices = await prisma.practice.findMany();
    let foundPractice = null;

    for (const p of practices) {
      for (const chapter of p.chapters) {
        const match = chapter.lessons.find((l) => l.id === lessonIdStr);
        if (match) {
          foundPractice = p;
          break;
        }
      }
      if (foundPractice) break;
    }

    if (!foundPractice) {
      return res.status(404).json({ message: 'Practice associated with this lesson not found' });
    }

    // 1. Update Progress
    let progress = await prisma.progress.findUnique({
      where: {
        userId_practiceId: {
          userId: user.id,
          practiceId: foundPractice.id,
        }
      }
    });

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId: user.id,
          practiceId: foundPractice.id,
          completedLessons: [],
          currentLessonId: null,
        }
      });
    }

    // Find the next lesson in sequence
    const allLessons: any[] = [];
    for (const chapter of foundPractice.chapters) {
      for (const les of chapter.lessons) {
        allLessons.push(les);
      }
    }

    const currentIdx = allLessons.findIndex((l) => l.id === lessonIdStr);
    let nextLessonId: string | null = null;
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
      nextLessonId = allLessons[currentIdx + 1].id;
    }

    // Update completed list if not already completed
    const updatedCompleted = [...progress.completedLessons];
    if (!updatedCompleted.includes(lessonIdStr)) {
      updatedCompleted.push(lessonIdStr);
    }

    progress = await prisma.progress.update({
      where: { id: progress.id },
      data: {
        completedLessons: updatedCompleted,
        currentLessonId: nextLessonId,
      }
    });

    // 2. Update Streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activeDate = new Date(user.lastActive.getFullYear(), user.lastActive.getMonth(), user.lastActive.getDate());
    const diffTime = today.getTime() - activeDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let streakUpdated = false;
    let originalStreak = user.streak;
    let newStreak = user.streak;

    if (user.streak === 0) {
      newStreak = 1;
      streakUpdated = true;
    } else if (diffDays === 1) {
      newStreak += 1;
      streakUpdated = true;
    } else if (diffDays > 1) {
      newStreak = 1; // Streak broken, resets to 1 as they complete a lesson today
      streakUpdated = true;
    }
    // If diffDays === 0, keep streak unchanged.

    // 3. Award XP
    const xpReward = 15;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        streak: newStreak,
        lastActive: now,
        xp: user.xp + xpReward
      }
    });

    const { password: _, ...userObj } = updatedUser;

    return res.json({
      message: 'Lesson completed successfully',
      xpGained: xpReward,
      user: userObj,
      progress,
      streakUpdated,
      originalStreak,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error completing lesson', error: (error as Error).message });
  }
});

export default router;
