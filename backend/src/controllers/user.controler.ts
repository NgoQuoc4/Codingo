import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as UserService from '../service/user.service';
import { AppError } from '../utils/errors';

const handleError = (res: Response, error: unknown, defaultMessage: string) => {
  if (error && typeof error === 'object' && 'isAppError' in error) {
    const appErr = error as AppError;
    return res.status(appErr.statusCode).json({ message: appErr.message });
  }
  const errMsg = error instanceof Error ? error.message : String(error);
  return res.status(500).json({ message: defaultMessage, error: errMsg });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObj = await UserService.getUserProfile(userId);
    return res.json(userObj);
  } catch (error) {
    return handleError(res, error, 'Error retrieving user profile');
  }
};

export const loseHeart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObj = await UserService.loseHeart(userId);
    return res.json({
      message: 'Heart lost',
      hearts: userObj.hearts,
      user: userObj,
    });
  } catch (error) {
    return handleError(res, error, 'Error deducting heart');
  }
};

export const refillHearts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObj = await UserService.refillHearts(userId);
    return res.json({
      message: 'Hearts fully refilled successfully!',
      user: userObj,
    });
  } catch (error) {
    return handleError(res, error, 'Error refilling hearts');
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObj = await UserService.updateProfile(userId, req.body);
    return res.json({
      message: 'Profile and preferences updated successfully!',
      user: userObj,
    });
  } catch (error) {
    return handleError(res, error, 'Error updating user details');
  }
};

export const addXp = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { xp } = req.body;
    const userObj = await UserService.addXp(userId, xp);
    return res.json({
      message: `${xp} XP added successfully!`,
      user: userObj,
    });
  } catch (error) {
    return handleError(res, error, 'Error adding XP');
  }
};
