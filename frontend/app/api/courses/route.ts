import { NextResponse } from 'next/server';
import { mockCourses, helper } from '../mockDb';

// API GET /api/courses - Lấy danh sách các bài học lý thuyết
export async function GET(req: Request) {
  try {
    // 1. Thử chuyển tiếp yêu cầu đến Express Backend (nếu đang chạy)
    const proxy = await helper.proxyFetch(req, '/api/courses', {
      method: 'GET',
    });

    // Nếu Backend phản hồi thành công, trả kết quả từ Backend về cho Client
    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Nếu Backend bị ngắt kết nối, sử dụng danh sách lý thuyết giả lập
    return NextResponse.json(mockCourses);
  } catch (error) {
    console.error('Lỗi trong API /api/courses:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
