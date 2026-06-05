import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as UserController from '../controllers/user.controller';

const router = Router();

// GET /api/users/profile - Get current user profile (with automatic hearts recovery)
router.get('/profile', authMiddleware, UserController.getProfile);

// POST /api/users/lose-heart - Deduct 1 heart when user makes a mistake
router.post('/lose-heart', authMiddleware, UserController.loseHeart);

// POST /api/users/refill-hearts - Refill hearts to max (5) using 50 XP
router.post('/refill-hearts', authMiddleware, UserController.refillHearts);

// PUT /api/users/update - Update profile and preferences settings
router.put('/update', authMiddleware, UserController.updateProfile);

// POST /api/users/add-xp - Add XP to the user when they complete phonetics training
router.post('/add-xp', authMiddleware, UserController.addXp);

export default router;
