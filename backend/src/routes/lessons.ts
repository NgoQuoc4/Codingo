import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as LessonsController from "../controllers/lessons.controller";

const router = Router();

// GET /api/lessons/:id - Get lesson exercises
router.get("/:id", authMiddleware, LessonsController.getLessonById);

// POST /api/lessons/:id/complete - Complete lesson, earn XP, update streak and progress
router.post("/:id/complete", authMiddleware, LessonsController.postCompleteLesson);

export default router;
