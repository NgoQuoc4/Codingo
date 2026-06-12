import { NextResponse } from 'next/server';
import { mockPractices, mockProgress, helper } from '../mockDb';

export async function GET(req: Request) {
  try {
    // 1. Try proxying to backend
    const proxy = await helper.proxyFetch(req, '/api/practices', {
      method: 'GET',
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Fallback mock practices with progress (matching learn dashboard format)
    const user = helper.authenticate(req);
    const progressList = mockProgress.filter(p => p.userId === user.id);

    const result = mockPractices.map((practice) => {
      const progress = progressList.find((p) => p.practiceId === practice.id);
      const totalLessons = practice.chapters.reduce(
        (acc, chapter) => acc + (chapter.lessons?.length || 0),
        0
      );
      const completedCount = progress ? progress.completedLessons.length : 0;

      return {
        _id: practice.id,
        title: practice.title,
        language: practice.language,
        description: practice.description,
        totalLessons,
        completedLessonsCount: completedCount,
        progress: progress || null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API /api/learn:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
