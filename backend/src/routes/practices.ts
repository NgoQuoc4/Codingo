import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as PracticesController from '../controllers/practices.controller';

const router = Router();

// GET /api/practices - Get all practices (requires auth to attach user progress)
router.get('/', authMiddleware, PracticesController.getPractices);

// GET /api/practices/:id - Get specific practice details and user progress
router.get('/:id', authMiddleware, PracticesController.getPracticeById);

export default router;
