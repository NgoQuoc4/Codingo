import { prisma } from '../db';
import { createNotFoundError } from '../utils/errors';

export const getPractices = async (userId: string) => {
  const practices = await prisma.practice.findMany({
    select: {
      id: true,
      title: true,
      language: true,
      description: true,
      chapters: true,
    }
  });

  // Find user progress list
  const progressList = await prisma.progress.findMany({
    where: { userId }
  });

  return practices.map((practice) => {
    const progress = progressList.find((p) => p.practiceId === practice.id);
    // Cast chapters as any to safely access nested JSON fields
    const chaptersArray = (practice.chapters as any) || [];
    const totalLessons = chaptersArray.reduce(
      (acc: number, chapter: any) => acc + (chapter.lessons?.length || 0),
      0
    );
    const completedCount = progress ? progress.completedLessons.length : 0;

    return {
      _id: practice.id, // Keep _id to avoid breaking frontend property names!
      title: practice.title,
      language: practice.language,
      description: practice.description,
      totalLessons,
      completedLessonsCount: completedCount,
      progress: progress || null,
    };
  });
};

export const getPracticeById = async (userId: string, id: string) => {
  const practice = await prisma.practice.findUnique({
    where: { id }
  });

  if (!practice) {
    throw createNotFoundError('Practice not found');
  }

  // Find progress
  let progress = await prisma.progress.findUnique({
    where: {
      userId_practiceId: {
        userId,
        practiceId: practice.id
      }
    }
  });

  const chaptersArray = (practice.chapters as any) || [];

  // If no progress document exists, initialize one
  if (!progress) {
    progress = await prisma.progress.create({
      data: {
        userId,
        practiceId: practice.id,
        completedLessons: [],
        currentLessonId: chaptersArray[0]?.lessons?.[0]?.id || null,
      }
    });
  }

  // Map `id` to `_id` for backward compatibility with frontend code
  const mappedPractice = {
    ...practice,
    _id: practice.id,
    chapters: chaptersArray.map((c: any) => ({
      ...c,
      _id: c.id,
      lessons: (c.lessons || []).map((l: any) => ({
        ...l,
        _id: l.id
      }))
    }))
  };

  return {
    course: mappedPractice, // Keep key name 'course' so frontend page.tsx doesn't break!
    progress,
  };
};
