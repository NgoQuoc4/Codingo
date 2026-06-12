import { NextResponse } from 'next/server';
import { mockUsers, helper, setSession } from '../../mockDb';

// API POST /api/auth/login - Đăng nhập tài khoản
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Kiểm tra tài khoản giả lập cục bộ
    if (!email || !password) {
      return NextResponse.json({ message: 'Vui lòng cung cấp email và mật khẩu!' }, { status: 400 });
    }

    const foundUser = mockUsers.find(u => u.email === email);
    if (!foundUser) {
      return NextResponse.json({ message: 'Tài khoản không tồn tại!' }, { status: 401 });
    }

    // Ở chế độ giả lập, chấp nhận mọi mật khẩu.
    // Sinh token thích hợp dựa trên vai trò người dùng (học viên hoặc admin)
    const token = foundUser.role === 'admin' ? 'mock-jwt-token-admin' : `mock-jwt-token-${foundUser.username}`;
    
    // Đồng bộ phiên đăng nhập cục bộ
    setSession(foundUser, token);

    return NextResponse.json({ user: foundUser, token });
  } catch (error) {
    console.error('Lỗi trong API /api/auth/login:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
