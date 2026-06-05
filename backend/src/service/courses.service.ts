import { prisma } from '../db';

export const getAllCourses = async () => {
  return prisma.course.findMany({
    orderBy: { createdAt: 'asc' }
  });
};
