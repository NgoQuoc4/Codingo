import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as CoursesService from '../service/courses.service';
import { AppError } from '../utils/errors';

const handleError = (res: Response, error: unknown, defaultMessage: string) => {
  if (error && typeof error === 'object' && 'isAppError' in error) {
    const appErr = error as AppError;
    return res.status(appErr.statusCode).json({ message: appErr.message });
  }
  const errMsg = error instanceof Error ? error.message : String(error);
  return res.status(500).json({ message: defaultMessage, error: errMsg });
};

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await CoursesService.getAllCourses();
    return res.json(courses);
  } catch (error) {
    return handleError(res, error, 'Error fetching theory lessons');
  }
};
