import { NextResponse } from 'next/server';
import { helper } from '../../mockDb';

// API PUT /api/users/update - Cập nhật thông tin cá nhân và cấu hình tuỳ chọn
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/users/update', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Lưu thông tin cấu hình cục bộ vào bộ nhớ
    const user = helper.authenticate(req);
    
    // Cập nhật các trường được thay đổi
    if (body.username !== undefined) user.username = body.username;
    if (body.email !== undefined) user.email = body.email;
    if (body.avatar !== undefined) user.avatar = body.avatar;
    if (body.soundEffects !== undefined) user.soundEffects = body.soundEffects;
    if (body.animations !== undefined) user.animations = body.animations;
    if (body.motivationalMessages !== undefined) user.motivationalMessages = body.motivationalMessages;
    if (body.listeningExercises !== undefined) user.listeningExercises = body.listeningExercises;
    if (body.darkMode !== undefined) user.darkMode = body.darkMode;

    return NextResponse.json({
      message: 'Cập nhật tài khoản thành công!',
      user,
    });
  } catch (error) {
    console.error('Lỗi trong API /api/users/update:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
