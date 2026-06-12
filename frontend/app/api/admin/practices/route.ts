import { NextResponse } from 'next/server';
import { mockPractices, helper } from '../../mockDb';

export async function GET(req: Request) {
  try {
    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, '/api/admin/practices', {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock practices full list
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const mapped = mockPractices.map(p => ({
      ...p,
      _id: p.id,
      chapters: p.chapters.map(c => ({
        ...c,
        _id: c.id,
        lessons: c.lessons.map(l => ({
          ...l,
          _id: l.id
        }))
      }))
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error in API GET /api/admin/practices:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, '/api/admin/practices', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock practice creation
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const { title, language, description } = body;
    if (!title || !language) {
      return NextResponse.json({ message: 'Vui lòng cung cấp đầy đủ Tiêu đề và Ngôn ngữ!' }, { status: 400 });
    }

    const newPractice = {
      id: `p-${Date.now()}`,
      title,
      language,
      description: description || '',
      chapters: []
    };

    mockPractices.push(newPractice);

    return NextResponse.json({
      message: 'Tạo lộ trình luyện tập thành công!',
      practice: { ...newPractice, _id: newPractice.id }
    });
  } catch (error) {
    console.error('Error in API POST /api/admin/practices:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
