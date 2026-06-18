import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// API POST /api/auth/logout - Đăng xuất tài khoản (Xóa HttpOnly Cookie)
export async function POST() {
  try {
    const cookieStore = await cookies();
    // Xóa cookie token ở trình duyệt
    cookieStore.delete('token');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi trong API /api/auth/logout:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
