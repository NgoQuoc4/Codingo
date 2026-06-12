import { NextResponse } from 'next/server';
import { mockPractices, helper } from '../../../mockDb';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: practiceId } = await params;

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, `/api/admin/practices/${practiceId}`, {
      method: 'DELETE',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock practice delete
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const foundIdx = mockPractices.findIndex(p => p.id === practiceId || (p as any)._id === practiceId);
    if (foundIdx === -1) {
      return NextResponse.json({ message: 'Không tìm thấy lộ trình luyện tập!' }, { status: 404 });
    }

    mockPractices.splice(foundIdx, 1);
    return NextResponse.json({ message: 'Xóa lộ trình luyện tập thành công!' });
  } catch (error) {
    console.error('Error in API DELETE /api/admin/practices/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
