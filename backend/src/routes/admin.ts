import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import * as AdminController from '../controllers/admin.controller';

const router = Router();

// Apply auth and admin protections to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats - Retrieve system-wide admin dashboard statistics
router.get('/stats', AdminController.getStats);

// ================= USER MANAGEMENT =================

// GET /api/admin/users - Get list of all users
router.get('/users', AdminController.getUsers);

// PUT /api/admin/users/:id - Update user properties (e.g. Adjust XP, hearts, streak, role)
router.put('/users/:id', AdminController.updateUser);

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', AdminController.deleteUser);

// ================= THEORY LESSONS (COURSE) CRUD =================

// POST /api/admin/courses - Create new theory lesson
router.post('/courses', AdminController.createCourse);

// PUT /api/admin/courses/:id - Update theory lesson
router.put('/courses/:id', AdminController.updateCourse);

// DELETE /api/admin/courses/:id - Delete theory lesson
router.delete('/courses/:id', AdminController.deleteCourse);

// ================= PRACTICES CRUD =================

// GET /api/admin/practices - Get all practices (full detail)
router.get('/practices', AdminController.getPractices);

// POST /api/admin/practices - Create a practice pathway
router.post('/practices', AdminController.createPractice);

// DELETE /api/admin/practices/:id - Delete a practice pathway
router.delete('/practices/:id', AdminController.deletePractice);

// PUT /api/admin/practices/:id/chapters - Update the nested chapters tree of a practice pathway
router.put('/practices/:id/chapters', AdminController.updatePracticeChapters);

export default router;
