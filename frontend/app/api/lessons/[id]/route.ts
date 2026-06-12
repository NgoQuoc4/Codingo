import { NextResponse } from 'next/server';
import { mockPractices, helper } from '../../mockDb';

// API GET /api/lessons/:id - Lấy danh sách câu hỏi của một bài học
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: lessonId } = await params;

    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, `/api/lessons/${lessonId}`, {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Tìm bài học trong danh sách lộ trình giả lập
    let foundLesson: any = null;
    for (const practice of mockPractices) {
      for (const chapter of practice.chapters) {
        const lesson = chapter.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          foundLesson = lesson;
          break;
        }
      }
      if (foundLesson) break;
    }

    if (!foundLesson) {
      return NextResponse.json({ message: 'Không tìm thấy thông tin bài học!' }, { status: 404 });
    }

    // Chuyển đổi ID để đồng bộ với thuộc tính ở frontend
    const mappedLesson = {
      ...foundLesson,
      _id: foundLesson.id,
      exercises: foundLesson.exercises.map((ex: any, idx: number) => ({
        ...ex,
        _id: ex.id || `ex-${idx}`,
      }))
    };

    return NextResponse.json(mappedLesson);
  } catch (error) {
    console.error('Lỗi trong API /api/lessons/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
