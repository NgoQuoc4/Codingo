import { NextResponse } from 'next/server';
import { mockPractices, mockProgress, helper } from '../../../mockDb';

// API POST /api/lessons/:id/complete - Hoàn thành một bài học (cộng XP, cập nhật streak, lưu tiến độ)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: lessonIdStr } = await params;

    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, `/api/lessons/${lessonIdStr}/complete`, {
      method: 'POST',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Xử lý hoàn thành bài học cục bộ
    const user = helper.authenticate(req);
    
    // Tìm lộ trình (practice) chứa bài học vừa hoàn thành
    let foundPractice: any = null;
    for (const practice of mockPractices) {
      for (const chapter of practice.chapters) {
        if (chapter.lessons.some((l) => l.id === lessonIdStr)) {
          foundPractice = practice;
          break;
        }
      }
      if (foundPractice) break;
    }

    if (!foundPractice) {
      return NextResponse.json({ message: 'Không tìm thấy bài thực hành chứa bài học này!' }, { status: 404 });
    }

    // Tìm bản ghi tiến trình học của user, nếu chưa có thì khởi tạo mới
    let progress = mockProgress.find(p => p.userId === user.id && p.practiceId === foundPractice.id);
    if (!progress) {
      progress = {
        id: `prog-${Date.now()}`,
        userId: user.id || 'user-id-1',
        practiceId: foundPractice.id,
        completedLessons: [],
        currentLessonId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProgress.push(progress);
    }

    // Xác định bài học tiếp theo trong lộ trình bằng cách duyệt danh sách phẳng
    const allLessons = foundPractice.chapters.flatMap((c: any) => c.lessons);
    const currentIdx = allLessons.findIndex((l: any) => l.id === lessonIdStr);
    let nextLessonId: string | null = null;
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
      nextLessonId = allLessons[currentIdx + 1].id;
    }

    // Thêm bài học hiện tại vào danh sách các bài học đã hoàn thành của tiến trình
    if (!progress.completedLessons.includes(lessonIdStr)) {
      progress.completedLessons.push(lessonIdStr);
    }
    progress.currentLessonId = nextLessonId; // Cập nhật bài học kế tiếp cần học
    progress.updatedAt = new Date().toISOString();

    // Tính toán và cập nhật số ngày học liên tục (streak)
    const now = new Date();
    const lastActive = new Date(user.lastActive);
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let streakUpdated = false;
    const originalStreak = user.streak;
    let newStreak = user.streak;

    if (user.streak === 0) {
      newStreak = 1;
      streakUpdated = true;
    } else if (diffDays === 1) {
      newStreak += 1;
      streakUpdated = true;
    } else if (diffDays > 1) {
      newStreak = 1; // Bị đứt streak -> Reset về 1 vì hôm nay đã học
      streakUpdated = true;
    }

    // Phần thưởng hoàn thành bài học là 15 XP
    const xpReward = 15;
    user.streak = newStreak;
    user.lastActive = now.toISOString();
    user.xp += xpReward;

    return NextResponse.json({
      message: 'Lesson completed successfully',
      xpGained: xpReward,
      user,
      progress,
      streakUpdated,
      originalStreak,
    });
  } catch (error) {
    console.error('Lỗi trong API /api/lessons/[id]/complete:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
