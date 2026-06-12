import { prisma } from "../db";
import { createAppError } from "../utils/errors";

// Hàm lấy thông tin chi tiết một bài học kèm danh sách câu hỏi theo ID
export const getLessonById = async (lessonId: string) => {
  // Tìm kiếm lộ trình thực hành (practice) có chứa bài học này
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
    throw createAppError(404, "Không tìm thấy thông tin lộ trình của bài học.");
  }

  // Quét qua tất cả các chương và tìm bài học khớp với ID yêu cầu
  const lessonMatch = practice.chapters
    .flatMap((chapter) => {
      return chapter.lessons;
    })
    .find((lesson) => lesson.id === lessonId);
  if (!lessonMatch) {
    throw createAppError(404, "Không tìm thấy chi tiết bài học.");
  }

  return lessonMatch;
};

// Hàm xử lý hoàn thành bài học (cộng XP, cập nhật streak, lưu tiến trình học tập)
export const completeLesson = async (userId: string, lessonIdStr: string) => {
  // Tìm kiếm thông tin người dùng hiện tại
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createAppError(404, "Không tìm thấy thông tin người dùng.");
  }

  // Tìm lộ trình luyện tập chứa bài học vừa học xong
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

  // 1. Cập nhật hoặc khởi tạo bản ghi tiến độ học tập (Progress)
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

  // Xác định bài học tiếp theo cần chuyển đến trong chuỗi danh sách phẳng
  const allLessons = foundPractice.chapters.flatMap(
    (chapter) => chapter.lessons,
  );

  const currentIdx = allLessons.findIndex((l) => l.id === lessonIdStr);
  let nextLessonId: string | null = null;
  if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
    nextLessonId = allLessons[currentIdx + 1].id;
  }

  // Thêm ID bài học hiện tại vào danh sách bài học đã hoàn thành
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

  // 2. Cập nhật chuỗi ngày học liên tục (Streak)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activeDate = new Date(
    user.lastActive.getFullYear(),
    user.lastActive.getMonth(),
    user.lastActive.getDate(),
  );
  // So sánh khoảng cách thời gian giữa ngày hoạt động cuối cùng và hôm nay
  const diffTime = today.getTime() - activeDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let streakUpdated = false;
  let originalStreak = user.streak;
  let newStreak = user.streak;

  if (user.streak === 0) {
    newStreak = 1;
    streakUpdated = true;
  } else if (diffDays === 1) {
    newStreak += 1; // Học tiếp liên tục ngày hôm sau -> Tăng streak
    streakUpdated = true;
  } else if (diffDays > 1) {
    newStreak = 1; // Bị đứt quãng -> Khởi động lại streak bằng 1
    streakUpdated = true;
  }

  // 3. Cộng điểm kinh nghiệm (+15 XP khi học xong 1 bài)
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
