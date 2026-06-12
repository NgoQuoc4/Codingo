import { NextResponse } from 'next/server';
import { helper } from '../../mockDb';

// API GET /api/users/profile - Lấy thông tin tài khoản hiện tại
export async function GET(req: Request) {
  try {
    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/users/profile', {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Lấy tài khoản giả lập và mô phỏng phục hồi tim
    const user = helper.authenticate(req);
    
    // Giả lập cơ chế hồi tim tự động (giống Duolingo): Hồi 1 tim mỗi 2 tiếng
    const now = new Date();
    const lastReset = new Date(user.lastHeartReset);
    const timeDiff = now.getTime() - lastReset.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (user.hearts < 5 && hoursDiff >= 2) {
      const heartsToRecover = Math.floor(hoursDiff / 2);
      user.hearts = Math.min(5, user.hearts + heartsToRecover);
      user.lastHeartReset = now.toISOString(); // Cập nhật thời điểm hồi mạng mới nhất
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Lỗi trong API /api/users/profile:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
