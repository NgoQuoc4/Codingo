import { Request, Response } from 'express';
import * as AuthService from '../service/auth.service';
import { AppError } from '../utils/errors';

const handleError = (res: Response, error: unknown, defaultMessage: string) => {
  if (error && typeof error === 'object' && 'isAppError' in error) {
    const appErr = error as AppError;
    return res.status(appErr.statusCode).json({ message: appErr.message });
  }
  const errMsg = error instanceof Error ? error.message : String(error);
  return res.status(500).json({ message: defaultMessage, error: errMsg });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await AuthService.registerUser(username, email, password);
    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error, 'Error registering user');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, 'Error logging in');
  }
};
