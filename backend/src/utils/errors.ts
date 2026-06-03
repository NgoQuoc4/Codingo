export interface AppError {
  isAppError: true;
  statusCode: number;
  message: string;
  stack?: string;
}

export const createAppError = (statusCode: number, message: string): AppError => {
  const tempError = new Error(message);
  return {
    isAppError: true,
    statusCode,
    message,
    stack: tempError.stack,
  };
};

export const createNotFoundError = (message: string = 'Resource not found'): AppError => 
  createAppError(404, message);

export const createBadRequestError = (message: string = 'Bad request'): AppError => 
  createAppError(400, message);

export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => 
  createAppError(401, message);

export const createInternalServerError = (message: string = 'Internal server error'): AppError => 
  createAppError(500, message);
