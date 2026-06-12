import { NextResponse } from 'next/server';
import { mockCourses, helper } from '../../../mockDb';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    const body = await req.json();

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, `/api/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock course edit
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const foundIdx = mockCourses.findIndex(c => c.id === courseId);
    if (foundIdx === -1) {
      return NextResponse.json({ message: 'Không tìm thấy bài học lý thuyết!' }, { status: 404 });
    }

    const targetCourse = mockCourses[foundIdx];
    if (body.title !== undefined) targetCourse.title = body.title;
    if (body.category !== undefined) targetCourse.category = body.category;
    if (body.tag !== undefined) targetCourse.tag = body.tag;
    if (body.shortDesc !== undefined) targetCourse.shortDesc = body.shortDesc;
    if (body.longDesc !== undefined) targetCourse.longDesc = body.longDesc;
    if (body.code !== undefined) targetCourse.code = body.code;
    if (body.useCase !== undefined) targetCourse.useCase = body.useCase;

    return NextResponse.json({
      message: 'Cập nhật bài học lý thuyết thành công!',
      course: targetCourse
    });
  } catch (error) {
    console.error('Error in API PUT /api/admin/courses/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;

    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, `/api/admin/courses/${courseId}`, {
      method: 'DELETE',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock course delete
    const user = helper.authenticate(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Không có quyền truy cập quản trị!' }, { status: 403 });
    }

    const foundIdx = mockCourses.findIndex(c => c.id === courseId);
    if (foundIdx === -1) {
      return NextResponse.json({ message: 'Không tìm thấy bài học lý thuyết!' }, { status: 404 });
    }

    mockCourses.splice(foundIdx, 1);
    return NextResponse.json({ message: 'Xóa bài học lý thuyết thành công!' });
  } catch (error) {
    console.error('Error in API DELETE /api/admin/courses/[id]:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
