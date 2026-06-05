import { prisma } from "../db";
import { createAppError } from "../utils/errors";
// lấy ra bài học theo id
export const getLessonById = async (lessonId: string) => {
  const practice = await prisma.practice.findFirst({
    where: {
      chapters: {
        some: {
          lessons: {
            some: {
              id: lessonId,
            },
          },
        },
      },
    },
  });
  if (!practice) {
    throw createAppError(404, "Lesson details not found");
  }

  const lessonMatch = practice.chapters
    .flatMap((chapter) => {
      return chapter.lessons;
    })
    .find((lesson) => lesson.id === lessonId);
  if (!lessonMatch) {
    throw createAppError(404, "Lesson details not found");
  }

  return lessonMatch;
};

// hoàn thành bài học
export const completeLesson = async (userId: string, lessonIdStr: string) => {
  // tìm user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createAppError(404, "Không tìm thấy thông tin người dùng.");
  }

  // Tìm bài tập thực hành có chứa bài học đã hoàn thành.
  const foundPractice = await prisma.practice.findFirst({
    where: {
      chapters: {
        some: {
          lessons: {
            some: {
              id: lessonIdStr,
            },
          },
        },
      },
    },
  });

  if (!foundPractice) {
    throw createAppError(
      404,
      "Không tìm thấy bài tập thực hành liên quan đến bài học này.",
    );
  }

  // 1. Cập nhật tiến trình học
  let progress = await prisma.progress.findUnique({
    where: {
      userId_practiceId: {
        userId: user.id,
        practiceId: foundPractice.id,
      },
    },
  });

  if (!progress) {
    progress = await prisma.progress.create({
      data: {
        userId: user.id,
        practiceId: foundPractice.id,
        completedLessons: [],
        currentLessonId: null,
      },
    });
  }

  // Tìm bài học tiếp theo trong chuỗi
  const allLessons = foundPractice.chapters.flatMap(
    (chapter) => chapter.lessons,
  );

  const currentIdx = allLessons.findIndex((l) => l.id === lessonIdStr);
  let nextLessonId: string | null = null;
  if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
    nextLessonId = allLessons[currentIdx + 1].id;
  }

  // Cập nhật danh sách các bài học đã hoàn thành nếu chưa có
  const updatedCompleted = [...progress.completedLessons];
  if (!updatedCompleted.includes(lessonIdStr)) {
    updatedCompleted.push(lessonIdStr);
  }

  progress = await prisma.progress.update({
    where: { id: progress.id },
    data: {
      completedLessons: updatedCompleted,
      currentLessonId: nextLessonId,
    },
  });

  // 2. Cập nhật chuỗi ngày học liên tục
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activeDate = new Date(
    user.lastActive.getFullYear(),
    user.lastActive.getMonth(),
    user.lastActive.getDate(),
  );
  const diffTime = today.getTime() - activeDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let streakUpdated = false;
  let originalStreak = user.streak;
  let newStreak = user.streak;

  if (user.streak === 0) {
    newStreak = 1;
    streakUpdated = true;
  } else if (diffDays === 1) {
    newStreak += 1;
    streakUpdated = true;
  } else if (diffDays > 1) {
    newStreak = 1; // Streak broken, resets to 1 as they complete a lesson today
    streakUpdated = true;
  }

  // 3. Cộng điểm kinh nghiệm
  const xpReward = 15;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      streak: newStreak,
      lastActive: now,
      xp: user.xp + xpReward,
    },
  });

  const { password: _, ...userObj } = updatedUser;

  return {
    xpGained: xpReward,
    user: userObj,
    progress,
    streakUpdated,
    originalStreak,
  };
};
