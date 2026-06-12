import { NextResponse } from 'next/server';
import { mockPractices, mockProgress, helper } from '../mockDb';

// API GET /api/practices - Lấy danh sách lộ trình học (practices) kèm tiến trình của học viên hiện tại
export async function GET(req: Request) {
  try {
    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/practices', {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Ghép nối danh sách lộ trình với tiến độ học cục bộ
    const user = helper.authenticate(req);
    // Lọc ra các bản ghi tiến độ của học viên này
    const progressList = mockProgress.filter(p => p.userId === user.id);

    const result = mockPractices.map((practice) => {
      // Tìm tiến độ học tương ứng với lộ trình này
      const progress = progressList.find((p) => p.practiceId === practice.id);
      // Đếm tổng số bài học của lộ trình bằng cách duyệt qua các chương
      const totalLessons = practice.chapters.reduce(
        (acc, chapter) => acc + (chapter.lessons?.length || 0),
        0
      );
      // Số lượng bài học đã hoàn thành
      const completedCount = progress ? progress.completedLessons.length : 0;

      return {
        _id: practice.id, // Dùng _id để khớp với cấu trúc MongoDB của frontend
        title: practice.title,
        language: practice.language,
        description: practice.description,
        totalLessons,
        completedLessonsCount: completedCount,
        progress: progress || null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi trong API /api/practices:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
