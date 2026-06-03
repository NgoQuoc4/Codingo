import { prisma } from '../db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { password, ...userObj } = user;
  return userObj;
};

export const loseHeart = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  let updatedUser = user;
  if (user.hearts > 0) {
    const originalHearts = user.hearts;
    const newHearts = user.hearts - 1;
    
    const updateData: any = {
      hearts: newHearts
    };
    
    // If hearts drop from full (5) to 4, start the regeneration timer now
    if (originalHearts === 5) {
      updateData.lastHeartReset = new Date();
    }
    
    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  const { password, ...userObj } = updatedUser;
  return userObj;
};

export const refillHearts = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.hearts === 5) {
    throw new BadRequestError('Hearts are already full');
  }

  const XP_COST = 50;
  if (user.xp < XP_COST) {
    throw new BadRequestError(`Insufficient XP. Refilling requires ${XP_COST} XP.`);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      hearts: 5,
      xp: user.xp - XP_COST,
      lastHeartReset: new Date() // Reset regeneration clock since it is full now
    }
  });

  const { password, ...userObj } = updatedUser;
  return userObj;
};

export const updateProfile = async (userId: string, updateFields: {
  username?: string;
  email?: string;
  avatar?: string;
  soundEffects?: boolean;
  animations?: boolean;
  motivationalMessages?: boolean;
  listeningExercises?: boolean;
  darkMode?: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updateData: any = {};

  // Validate email / username uniqueness if they are changing
  if (updateFields.username && updateFields.username !== user.username) {
    const existingUser = await prisma.user.findFirst({
      where: { username: updateFields.username }
    });
    if (existingUser) {
      throw new BadRequestError('Username is already taken');
    }
    updateData.username = updateFields.username;
  }

  if (updateFields.email && updateFields.email !== user.email) {
    const existingUser = await prisma.user.findFirst({
      where: { email: updateFields.email }
    });
    if (existingUser) {
      throw new BadRequestError('Email is already taken');
    }
    updateData.email = updateFields.email;
  }

  if (updateFields.avatar !== undefined) updateData.avatar = updateFields.avatar;
  if (updateFields.soundEffects !== undefined) updateData.soundEffects = updateFields.soundEffects;
  if (updateFields.animations !== undefined) updateData.animations = updateFields.animations;
  if (updateFields.motivationalMessages !== undefined) updateData.motivationalMessages = updateFields.motivationalMessages;
  if (updateFields.listeningExercises !== undefined) updateData.listeningExercises = updateFields.listeningExercises;
  if (updateFields.darkMode !== undefined) updateData.darkMode = updateFields.darkMode;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  const { password, ...userObj } = updatedUser;
  return userObj;
};

export const addXp = async (userId: string, xp: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (typeof xp !== 'number' || xp <= 0) {
    throw new BadRequestError('Invalid XP amount');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { xp: user.xp + xp }
  });

  const { password, ...userObj } = updatedUser;
  return userObj;
};
