import { AuthRequest } from "../middleware/auth";
import { Response } from "express";
import * as LessonService from "../service/lessons.service";
import { AppError } from "../utils/errors";

const handleError = (res: Response, error: unknown, defaultMessage: string) => {
  if (error && typeof error === "object" && "isAppError" in error) {
    const appErr = error as AppError;
    return res.status(appErr.statusCode).json({ message: appErr.message });
  }
  const errMsg = error instanceof Error ? error.message : String(error);
  return res.status(500).json({ message: defaultMessage, error: errMsg });
};

export const getLessonById = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = req.params.id;
    const lessonMatch = await LessonService.getLessonById(lessonId);
    return res.status(200).json(lessonMatch);
  } catch (error) {
    return handleError(res, error, "Error fetching lesson details");
  }
};

export const postCompleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonIdStr = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    const result = await LessonService.completeLesson(userId, lessonIdStr);

    return res.status(200).json({
      message: "Lesson completed successfully",
      ...result,
    });
  } catch (error) {
    return handleError(res, error, "Error completing lesson");
  }
};
