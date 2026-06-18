import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
      const data = proxy.data as { user: any; token: string };
      const response = NextResponse.json({ user: data.user, success: true });
      
      // Thiết lập HttpOnly Cookie để lưu trữ token an toàn chống XSS
      const cookieStore = await cookies();
      cookieStore.set('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // Hết hạn sau 7 ngày
      });

      return response;
    }

    // Nếu backend online nhưng trả về lỗi (ví dụ: mật khẩu sai), trả thẳng lỗi đó cho client
    if (proxy.isOffline === false) {
      return NextResponse.json(
        proxy.data || { message: 'Đăng nhập thất bại!' },
        { status: proxy.status || 401 }
      );
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

    const response = NextResponse.json({ user: foundUser, success: true });
    
    // Thiết lập HttpOnly Cookie cho dữ liệu giả lập
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // Hết hạn sau 7 ngày
    });

    return response;
  } catch (error) {
    console.error('Lỗi trong API /api/auth/login:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
