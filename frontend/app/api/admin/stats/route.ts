import { NextResponse } from 'next/server';
import { mockUsers, mockPractices, mockCourses, helper } from '../../mockDb';

export async function GET(req: Request) {
  try {
    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, '/api/admin/stats', {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock admin check and stats
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const totalUsers = mockUsers.length;
    const totalPractices = mockPractices.length;
    const totalCourses = mockCourses.length;

    // Sum total XP earned by all users
    const totalXp = mockUsers.reduce((acc, u) => acc + u.xp, 0);

    return NextResponse.json({
      totalUsers,
      totalPractices,
      totalCourses,
      totalXp,
    });
  } catch (error) {
    console.error('Error in API /api/admin/stats:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
