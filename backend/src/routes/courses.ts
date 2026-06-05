import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as CoursesController from '../controllers/courses.controller';

const router = Router();

// GET /api/courses - Get all theory courses/lessons
router.get('/', authMiddleware, CoursesController.getCourses);

export default router;
