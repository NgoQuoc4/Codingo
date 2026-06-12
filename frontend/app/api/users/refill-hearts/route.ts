import { NextResponse } from 'next/server';
import { helper } from '../../mockDb';

// API POST /api/users/refill-hearts - Nạp đầy tim (sử dụng điểm kinh nghiệm XP làm tiền tệ)
export async function POST(req: Request) {
  try {
    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/users/refill-hearts', {
      method: 'POST',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Mua tim bằng XP giả lập
    const user = helper.authenticate(req);

    // Kiểm tra xem tim đã đầy sẵn chưa
    if (user.hearts === 5) {
      return NextResponse.json({ message: 'Số tim của bạn đã đầy (5 tim)!' }, { status: 400 });
    }

    const XP_COST = 50; // Giá mua là 50 XP
    // Kiểm tra xem số dư XP có đủ không
    if (user.xp < XP_COST) {
      return NextResponse.json({ message: `Không đủ kinh nghiệm (XP). Cần ${XP_COST} XP để nạp tim!` }, { status: 400 });
    }

    // Thực hiện trừ XP và hồi đầy 5 tim
    user.hearts = 5;
    user.xp -= XP_COST;
    user.lastHeartReset = new Date().toISOString(); // Reset lại mốc thời gian hồi mạng

    return NextResponse.json({
      message: 'Đã nạp đầy tim thành công!',
      user,
    });
  } catch (error) {
    console.error('Lỗi trong API /api/users/refill-hearts:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
