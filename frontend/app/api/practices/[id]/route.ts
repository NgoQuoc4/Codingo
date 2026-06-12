import { NextResponse } from 'next/server';
import { mockPractices, mockProgress, helper } from '../../mockDb';

// API GET /api/practices/:id - Lấy chi tiết lộ trình học và tiến trình tương ứng
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: practiceId } = await params;

    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, `/api/practices/${practiceId}`, {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Lấy dữ liệu cục bộ từ danh sách giả lập
    const user = helper.authenticate(req);
    const practice = mockPractices.find(p => p.id === practiceId);
    if (!practice) {
      return NextResponse.json({ message: 'Không tìm thấy lộ trình luyện tập này!' }, { status: 404 });
    }

    // Truy vấn bản ghi tiến trình học của user đối với lộ trình này
    let progress = mockProgress.find(p => p.userId === user.id && p.practiceId === practiceId);
    
    // Nếu chưa có bản ghi tiến trình học, khởi tạo mới và bắt đầu từ bài học đầu tiên
    if (!progress) {
      const firstLessonId = practice.chapters[0]?.lessons?.[0]?.id || null;
      progress = {
        id: `prog-${Date.now()}`,
        userId: user.id || 'user-id-1',
        practiceId: practice.id,
        completedLessons: [],
        currentLessonId: firstLessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProgress.push(progress); // Lưu bản ghi tiến trình vào database giả lập
    }

    // Chuyển đổi tên thuộc tính 'id' thành '_id' để đảm bảo tương thích với cấu trúc MongoDB ở frontend
    const mappedPractice = {
      ...practice,
      _id: practice.id,
      chapters: practice.chapters.map((c) => ({
        ...c,
        _id: c.id,
        lessons: c.lessons.map((l) => ({
          ...l,
          _id: l.id,
        }))
      }))
    };

    return NextResponse.json({
      course: mappedPractice, // Giữ tên key 'course' giống cách định dạng của backend
      progress,
    });
  } catch (error) {
    console.error('Lỗi trong API /api/practices/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
