import { NextResponse } from 'next/server';
import { helper, mockUsers } from '../../mockDb';

// API GET /api/users/leaderboard - Lấy danh sách bảng xếp hạng người dùng
export async function GET(req: Request) {
  try {
    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const urlObj = new URL(req.url);
    const limit = urlObj.searchParams.get('limit') || '10';
    const proxy = await helper.proxyFetch(req, `/api/users/leaderboard?limit=${limit}`, {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Lấy toàn bộ người dùng giả lập, sắp xếp theo XP giảm dần
    const limitNum = parseInt(limit, 10) || 10;
    const sortedMockUsers = [...mockUsers]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limitNum);

    return NextResponse.json(sortedMockUsers);
  } catch (error) {
    console.error('Lỗi trong API /api/users/leaderboard:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
