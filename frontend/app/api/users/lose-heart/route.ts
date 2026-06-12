import { NextResponse } from 'next/server';
import { helper } from '../../mockDb';

// API POST /api/users/lose-heart - Khấu trừ 1 tim (khi trả lời sai)
export async function POST(req: Request) {
  try {
    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/users/lose-heart', {
      method: 'POST',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Trừ tim giả lập
    const user = helper.authenticate(req);
    
    if (user.hearts > 0) {
      const originalHearts = user.hearts;
      user.hearts -= 1;
      
      // Nếu số tim giảm từ tối đa (5) xuống 4, ghi lại thời điểm bắt đầu chu kỳ đếm giờ hồi tim
      if (originalHearts === 5) {
        user.lastHeartReset = new Date().toISOString();
      }
    }

    return NextResponse.json({
      message: 'Mất 1 tim',
      hearts: user.hearts,
      user,
    });
  } catch (error) {
    console.error('Lỗi trong API /api/users/lose-heart:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
