import { NextResponse } from 'next/server';
import { mockCourses, helper } from '../../mockDb';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, '/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock course creation
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const { title, category, tag, shortDesc, longDesc, code, useCase } = body;
    if (!title || !category || !code) {
      return NextResponse.json({ message: 'Vui lòng cung cấp Tiêu đề, Thể loại và Mã nguồn!' }, { status: 400 });
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      category,
      tag: tag || category,
      shortDesc: shortDesc || '',
      longDesc: longDesc || '',
      code,
      useCase: useCase || '',
    };

    mockCourses.push(newCourse);

    return NextResponse.json({
      message: 'Tạo bài lý thuyết mới thành công!',
      course: newCourse
    });
  } catch (error) {
    console.error('Error in API POST /api/admin/courses:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
