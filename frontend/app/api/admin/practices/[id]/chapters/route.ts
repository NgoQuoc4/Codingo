import { NextResponse } from 'next/server';
import { mockPractices, helper } from '../../../../mockDb';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: practiceId } = await params;
    const body = await req.json();

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, `/api/admin/practices/${practiceId}/chapters`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock chapters update
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const { chapters } = body;
    if (!chapters || !Array.isArray(chapters)) {
      return NextResponse.json({ message: 'Danh sách chương (chapters) không hợp lệ!' }, { status: 400 });
    }

    const foundIdx = mockPractices.findIndex(p => p.id === practiceId || (p as any)._id === practiceId);
    if (foundIdx === -1) {
      return NextResponse.json({ message: 'Không tìm thấy lộ trình luyện tập!' }, { status: 404 });
    }

    // Map chapters and chapters' lessons properly
    mockPractices[foundIdx].chapters = chapters.map((c: any) => ({
      id: c.id || c._id || `c-${Date.now()}-${Math.random()}`,
      title: c.title || '',
      lessons: (c.lessons || []).map((l: any) => ({
        id: l.id || l._id || `l-${Date.now()}-${Math.random()}`,
        title: l.title || '',
        exercises: (l.exercises || []).map((ex: any) => ({
          type: ex.type || 'multiple_choice',
          question: ex.question || '',
          options: ex.options || [],
          correctAnswer: ex.correctAnswer || ''
        }))
      }))
    }));

    return NextResponse.json({
      message: 'Cập nhật danh sách chương và bài học thành công!',
      practice: mockPractices[foundIdx]
    });
  } catch (error) {
    console.error('Error in API PUT /api/admin/practices/[id]/chapters:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
