import { NextResponse } from 'next/server';
import { mockUsers, helper } from '../../../mockDb';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const body = await req.json();

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, `/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock user edit
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const foundIdx = mockUsers.findIndex(u => u.id === userId || u._id === userId);
    if (foundIdx === -1) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng!' }, { status: 404 });
    }

    const targetUser = mockUsers[foundIdx];
    if (body.xp !== undefined) targetUser.xp = body.xp;
    if (body.hearts !== undefined) targetUser.hearts = body.hearts;
    if (body.streak !== undefined) targetUser.streak = body.streak;
    if (body.role !== undefined) targetUser.role = body.role;
    if (body.username !== undefined) targetUser.username = body.username;
    if (body.email !== undefined) targetUser.email = body.email;

    return NextResponse.json({ message: 'Cập nhật người dùng thành công!', user: targetUser });
  } catch (error) {
    console.error('Error in API PUT /api/admin/users/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, `/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock user delete
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const foundIdx = mockUsers.findIndex(u => u.id === userId || u._id === userId);
    if (foundIdx === -1) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng!' }, { status: 404 });
    }

    mockUsers.splice(foundIdx, 1);
    return NextResponse.json({ message: 'Xóa người dùng thành công!' });
  } catch (error) {
    console.error('Error in API DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
