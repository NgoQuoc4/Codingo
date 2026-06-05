import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as AdminService from '../service/admin.service';
import { AppError } from '../utils/errors';

const handleError = (res: Response, error: unknown, defaultMessage: string) => {
  if (error && typeof error === 'object' && 'isAppError' in error) {
    const appErr = error as AppError;
    return res.status(appErr.statusCode).json({ message: appErr.message });
  }
  const errMsg = error instanceof Error ? error.message : String(error);
  return res.status(500).json({ message: defaultMessage, error: errMsg });
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AdminService.getStats();
    return res.json(stats);
  } catch (error) {
    return handleError(res, error, 'Error fetching stats');
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await AdminService.getUsers();
    return res.json(users);
  } catch (error) {
    return handleError(res, error, 'Error fetching users');
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser = await AdminService.updateUser(id, req.body);
    return res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    return handleError(res, error, 'Error updating user');
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await AdminService.deleteUser(id);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'Error deleting user');
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const newCourse = await AdminService.createCourse(req.body);
    return res.status(201).json({ message: 'Theory lesson created successfully', course: newCourse });
  } catch (error) {
    return handleError(res, error, 'Error creating theory lesson');
  }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCourse = await AdminService.updateCourse(id, req.body);
    return res.json({ message: 'Theory lesson updated successfully', course: updatedCourse });
  } catch (error) {
    return handleError(res, error, 'Error updating theory lesson');
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await AdminService.deleteCourse(id);
    return res.json({ message: 'Theory lesson deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'Error deleting theory lesson');
  }
};

export const getPractices = async (req: AuthRequest, res: Response) => {
  try {
    const practices = await AdminService.getPractices();
    return res.json(practices);
  } catch (error) {
    return handleError(res, error, 'Error fetching practices');
  }
};

export const createPractice = async (req: AuthRequest, res: Response) => {
  try {
    const newPractice = await AdminService.createPractice(req.body);
    return res.status(201).json({ message: 'Practice pathway created successfully', practice: newPractice });
  } catch (error) {
    return handleError(res, error, 'Error creating practice');
  }
};

export const deletePractice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await AdminService.deletePractice(id);
    return res.json({ message: 'Practice pathway deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'Error deleting practice');
  }
};

export const updatePracticeChapters = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { chapters } = req.body;
    const updatedPractice = await AdminService.updatePracticeChapters(id, chapters);
    return res.json({ message: 'Practice chapters updated successfully', practice: updatedPractice });
  } catch (error) {
    return handleError(res, error, 'Error updating chapters');
  }
};
