import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, adminMiddleware } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Apply auth and admin protections to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats - Retrieve system-wide admin dashboard statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPractices = await prisma.practice.count();
    const totalCourses = await prisma.course.count(); // Theory lessons

    return res.json({
      totalUsers,
      totalPractices,
      totalCourses,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching stats', error: (error as Error).message });
  }
});

// ================= USER MANAGEMENT =================

// GET /api/admin/users - Get list of all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        xp: true,
        hearts: true,
        streak: true,
        role: true,
        createdAt: true,
        lastActive: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: (error as Error).message });
  }
});

// PUT /api/admin/users/:id - Update user properties (e.g. Adjust XP, hearts, streak, role)
router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { xp, hearts, streak, role } = req.body;

    const updateData: any = {};
    if (xp !== undefined) updateData.xp = parseInt(xp);
    if (hearts !== undefined) updateData.hearts = parseInt(hearts);
    if (streak !== undefined) updateData.streak = parseInt(streak);
    if (role !== undefined) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        xp: true,
        hearts: true,
        streak: true,
        role: true,
      }
    });

    return res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await prisma.user.delete({
      where: { id }
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
  }
});

// ================= THEORY LESSONS (COURSE) CRUD =================

// POST /api/admin/courses - Create new theory lesson
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, tag, shortDesc, longDesc, code, useCase } = req.body;

    if (!title || !category || !tag || !shortDesc || !longDesc || !code || !useCase) {
      return res.status(400).json({ message: 'All theory fields are required' });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        category,
        tag,
        shortDesc,
        longDesc,
        code,
        useCase,
      }
    });

    return res.status(201).json({ message: 'Theory lesson created successfully', course: newCourse });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating theory lesson', error: (error as Error).message });
  }
});

// PUT /api/admin/courses/:id - Update theory lesson
router.put('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, tag, shortDesc, longDesc, code, useCase } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        category,
        tag,
        shortDesc,
        longDesc,
        code,
        useCase,
      }
    });

    return res.json({ message: 'Theory lesson updated successfully', course: updatedCourse });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating theory lesson', error: (error as Error).message });
  }
});

// DELETE /api/admin/courses/:id - Delete theory lesson
router.delete('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({
      where: { id }
    });

    return res.json({ message: 'Theory lesson deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting theory lesson', error: (error as Error).message });
  }
});

// ================= PRACTICES CRUD =================

// GET /api/admin/practices - Get all practices (full detail)
router.get('/practices', async (req: AuthRequest, res: Response) => {
  try {
    const practices = await prisma.practice.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(practices);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching practices', error: (error as Error).message });
  }
});

// POST /api/admin/practices - Create a practice pathway
router.post('/practices', async (req: AuthRequest, res: Response) => {
  try {
    const { title, language, description } = req.body;
    
    if (!title || !language) {
      return res.status(400).json({ message: 'Title and Language are required' });
    }

    const newPractice = await prisma.practice.create({
      data: {
        title,
        language,
        description: description || '',
        chapters: [],
      }
    });

    return res.status(201).json({ message: 'Practice pathway created successfully', practice: newPractice });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating practice', error: (error as Error).message });
  }
});

// DELETE /api/admin/practices/:id - Delete a practice pathway
router.delete('/practices/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.practice.delete({
      where: { id }
    });

    return res.json({ message: 'Practice pathway deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting practice', error: (error as Error).message });
  }
});

// PUT /api/admin/practices/:id/chapters - Update the nested chapters tree of a practice pathway
router.put('/practices/:id/chapters', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { chapters } = req.body;

    if (!Array.isArray(chapters)) {
      return res.status(400).json({ message: 'Chapters must be an array' });
    }

    const updatedPractice = await prisma.practice.update({
      where: { id },
      data: { chapters }
    });

    return res.json({ message: 'Practice chapters updated successfully', practice: updatedPractice });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating chapters', error: (error as Error).message });
  }
});

export default router;
