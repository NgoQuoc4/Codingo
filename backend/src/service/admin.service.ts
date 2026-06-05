import { prisma } from '../db';
import { createBadRequestError } from '../utils/errors';

export const getStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalPractices = await prisma.practice.count();
  const totalCourses = await prisma.course.count(); // Theory lessons

  return {
    totalUsers,
    totalPractices,
    totalCourses,
  };
};

export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      xp: true,
      hearts: true,
      streak: true,
      role: true,
      createdAt: true,
      lastActive: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateUser = async (id: string, data: { xp?: any; hearts?: any; streak?: any; role?: string }) => {
  const updateData: any = {};
  if (data.xp !== undefined) updateData.xp = parseInt(data.xp);
  if (data.hearts !== undefined) updateData.hearts = parseInt(data.hearts);
  if (data.streak !== undefined) updateData.streak = parseInt(data.streak);
  if (data.role !== undefined) updateData.role = data.role;

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      xp: true,
      hearts: true,
      streak: true,
      role: true,
    }
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id }
  });
};

export const createCourse = async (data: {
  title?: string;
  category?: string;
  tag?: string;
  shortDesc?: string;
  longDesc?: string;
  code?: string;
  useCase?: string;
}) => {
  const { title, category, tag, shortDesc, longDesc, code, useCase } = data;

  if (!title || !category || !tag || !shortDesc || !longDesc || !code || !useCase) {
    throw createBadRequestError('All theory fields are required');
  }

  return prisma.course.create({
    data: {
      title,
      category,
      tag,
      shortDesc,
      longDesc,
      code,
      useCase,
    }
  });
};

export const updateCourse = async (id: string, data: {
  title?: string;
  category?: string;
  tag?: string;
  shortDesc?: string;
  longDesc?: string;
  code?: string;
  useCase?: string;
}) => {
  const { title, category, tag, shortDesc, longDesc, code, useCase } = data;

  return prisma.course.update({
    where: { id },
    data: {
      title,
      category,
      tag,
      shortDesc,
      longDesc,
      code,
      useCase,
    }
  });
};

export const deleteCourse = async (id: string) => {
  return prisma.course.delete({
    where: { id }
  });
};

export const getPractices = async () => {
  return prisma.practice.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const createPractice = async (data: { title?: string; language?: string; description?: string }) => {
  const { title, language, description } = data;

  if (!title || !language) {
    throw createBadRequestError('Title and Language are required');
  }

  return prisma.practice.create({
    data: {
      title,
      language,
      description: description || '',
      chapters: [],
    }
  });
};

export const deletePractice = async (id: string) => {
  return prisma.practice.delete({
    where: { id }
  });
};

export const updatePracticeChapters = async (id: string, chapters: any) => {
  if (!Array.isArray(chapters)) {
    throw createBadRequestError('Chapters must be an array');
  }

  return prisma.practice.update({
    where: { id },
    data: { chapters }
  });
};
