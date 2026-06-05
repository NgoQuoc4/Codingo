import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as PracticesService from '../service/practices.service';
import { AppError } from '../utils/errors';

const handleError = (res: Response, error: unknown, defaultMessage: string) => {
  if (error && typeof error === 'object' && 'isAppError' in error) {
    const appErr = error as AppError;
    return res.status(appErr.statusCode).json({ message: appErr.message });
  }
  const errMsg = error instanceof Error ? error.message : String(error);
  return res.status(500).json({ message: defaultMessage, error: errMsg });
};

export const getPractices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await PracticesService.getPractices(userId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error, 'Error fetching practices');
  }
};

export const getPracticeById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const practiceId = req.params.id;
    const result = await PracticesService.getPracticeById(userId, practiceId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error, 'Error fetching practice details');
  }
};
