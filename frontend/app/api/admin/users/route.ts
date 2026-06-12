import { NextResponse } from 'next/server';
import { mockUsers, helper } from '../../mockDb';

export async function GET(req: Request) {
  try {
    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, '/api/admin/users', {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock users list
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error('Error in API /api/admin/users:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
