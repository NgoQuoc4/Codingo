import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mockUsers, helper, setSession } from '../../mockDb';

// API POST /api/auth/register - Đăng ký tài khoản mới cho học viên
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // 1. Chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
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

    // 2. Chế độ dự phòng (Fallback): Xử lý đăng ký giả lập cục bộ
    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin!' }, { status: 400 });
    }

    // Kiểm tra xem email hoặc tên đăng nhập đã được đăng ký chưa
    const emailExists = mockUsers.some(u => u.email === email);
    const usernameExists = mockUsers.some(u => u.username === username);

    if (emailExists) {
      return NextResponse.json({ message: 'Email đã được đăng ký!' }, { status: 400 });
    }
    if (usernameExists) {
      return NextResponse.json({ message: 'Tên người dùng đã được sử dụng!' }, { status: 400 });
    }

    // Tạo đối tượng người dùng mới với các thuộc tính mặc định
    const newUser = {
      id: `user-id-${Date.now()}`,
      username,
      email,
      xp: 0, // Điểm kinh nghiệm khởi đầu
      hearts: 5, // Số lượng mạng khởi đầu
      lastHeartReset: new Date().toISOString(),
      streak: 0,
      lastActive: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`, // Tạo avatar ngẫu nhiên
      soundEffects: true,
      animations: true,
      motivationalMessages: true,
      listeningExercises: true,
      darkMode: 'dark',
      role: 'user',
    };

    // Lưu người dùng mới vào danh sách giả lập
    mockUsers.push(newUser);
    const token = `mock-jwt-token-${username}`;
    
    // Ghi nhận trạng thái đăng nhập cho tài khoản này
    setSession(newUser, token);

    const response = NextResponse.json({ user: newUser, success: true });
    
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
    console.error('Lỗi trong API /api/auth/register:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
