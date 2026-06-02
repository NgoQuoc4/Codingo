import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/users/profile - Get current user profile (with automatic hearts recovery)
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userObj } = user;
    return res.json(userObj);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user profile', error: (error as Error).message });
  }
});

// POST /api/users/lose-heart - Deduct 1 heart when user makes a mistake
router.post('/lose-heart', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.hearts > 0) {
      const originalHearts = user.hearts;
      const newHearts = user.hearts - 1;
      
      const updateData: any = {
        hearts: newHearts
      };
      
      // If hearts drop from full (5) to 4, start the regeneration timer now
      if (originalHearts === 5) {
        updateData.lastHeartReset = new Date();
      }
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
    }

    const { password: _, ...userObj } = user;

    return res.json({
      message: 'Heart lost',
      hearts: user.hearts,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error deducting heart', error: (error as Error).message });
  }
});

// POST /api/users/refill-hearts - Refill hearts to max (5) using 50 XP
router.post('/refill-hearts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.hearts === 5) {
      return res.status(400).json({ message: 'Hearts are already full' });
    }

    const XP_COST = 50;
    if (user.xp < XP_COST) {
      return res.status(400).json({ message: `Insufficient XP. Refilling requires ${XP_COST} XP.` });
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        hearts: 5,
        xp: user.xp - XP_COST,
        lastHeartReset: new Date() // Reset regeneration clock since it is full now
      }
    });

    const { password: _, ...userObj } = user;

    return res.json({
      message: 'Hearts fully refilled successfully!',
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error refilling hearts', error: (error as Error).message });
  }
});

// PUT /api/users/update - Update profile and preferences settings
router.put('/update', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      username,
      email,
      avatar,
      soundEffects,
      animations,
      motivationalMessages,
      listeningExercises,
      darkMode
    } = req.body;

    const updateData: any = {};

    // Validate email / username uniqueness if they are changing
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateData.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      updateData.email = email;
    }

    if (avatar !== undefined) updateData.avatar = avatar;
    if (soundEffects !== undefined) updateData.soundEffects = soundEffects;
    if (animations !== undefined) updateData.animations = animations;
    if (motivationalMessages !== undefined) updateData.motivationalMessages = motivationalMessages;
    if (listeningExercises !== undefined) updateData.listeningExercises = listeningExercises;
    if (darkMode !== undefined) updateData.darkMode = darkMode;

    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    const { password: _, ...userObj } = user;

    return res.json({
      message: 'Profile and preferences updated successfully!',
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user details', error: (error as Error).message });
  }
});

// POST /api/users/add-xp - Add XP to the user when they complete phonetics training
router.post('/add-xp', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { xp } = req.body;
    if (typeof xp !== 'number' || xp <= 0) {
      return res.status(400).json({ message: 'Invalid XP amount' });
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: { xp: user.xp + xp }
    });

    const { password: _, ...userObj } = user;

    return res.json({
      message: `${xp} XP added successfully!`,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding XP', error: (error as Error).message });
  }
});

export default router;
