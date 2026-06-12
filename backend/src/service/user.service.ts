import { prisma } from '../db';
import { createNotFoundError, createBadRequestError } from '../utils/errors';

// Hàm lấy thông tin hồ sơ của người dùng dựa theo ID
// Đồng thời kiểm tra và reset streak về 0 nếu người dùng không học > 1 ngày
export const getUserProfile = async (userId: string) => {
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createNotFoundError('User not found');
  }

  // Kiểm tra streak: nếu người dùng bỏ học > 1 ngày thì reset streak về 0
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDay = new Date(
    user.lastActive.getFullYear(),
    user.lastActive.getMonth(),
    user.lastActive.getDate()
  );
  const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

  // Nếu đã qua hơn 1 ngày (tức là bỏ học ít nhất 1 ngày) thì reset streak về 0
  if (diffDays > 1 && user.streak > 0) {
    user = await prisma.user.update({
      where: { id: userId },
      data: { streak: 0 }
    });
  }

  // Loại bỏ mật khẩu băm trước khi trả về dữ liệu
  const { password, ...userObj } = user;
  return userObj;
};

// Hàm xử lý khấu trừ 1 tim (khi học viên trả lời câu hỏi sai)
export const loseHeart = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createNotFoundError('User not found');
  }

  let updatedUser = user;
  if (user.hearts > 0) {
    const originalHearts = user.hearts;
    const newHearts = user.hearts - 1;
    
    const updateData: any = {
      hearts: newHearts
    };
    
    // Nếu tim giảm từ đầy (5) xuống 4, ghi nhận mốc thời gian hồi phục tự động bắt đầu chạy
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

// Hàm nạp đầy tim (sử dụng 50 XP để đổi lại đầy 5 tim)
export const refillHearts = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createNotFoundError('User not found');
  }

  // Không thể nạp nếu đã đầy tim
  if (user.hearts === 5) {
    throw createBadRequestError('Hearts are already full');
  }

  const XP_COST = 50; // Phí nạp tim
  if (user.xp < XP_COST) {
    throw createBadRequestError(`Insufficient XP. Refilling requires ${XP_COST} XP.`);
  }

  // Khấu trừ 50 XP và hồi phục tim lên 5
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      hearts: 5,
      xp: user.xp - XP_COST,
      lastHeartReset: new Date() // Đưa mốc đếm giờ hồi tim về hiện tại do đã đầy mạng
    }
  });

  const { password, ...userObj } = updatedUser;
  return userObj;
};

// Hàm cập nhật thông tin tài khoản và cấu hình hệ thống
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
    throw createNotFoundError('User not found');
  }

  const updateData: any = {};

  // Kiểm tra tính độc nhất của tên đăng nhập nếu có sự thay đổi
  if (updateFields.username && updateFields.username !== user.username) {
    const existingUser = await prisma.user.findFirst({
      where: { username: updateFields.username }
    });
    if (existingUser) {
      throw createBadRequestError('Username is already taken');
    }
    updateData.username = updateFields.username;
  }

  // Kiểm tra tính độc nhất của email nếu có sự thay đổi
  if (updateFields.email && updateFields.email !== user.email) {
    const existingUser = await prisma.user.findFirst({
      where: { email: updateFields.email }
    });
    if (existingUser) {
      throw createBadRequestError('Email is already taken');
    }
    updateData.email = updateFields.email;
  }

  // Gán cấu hình mới tương ứng
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

// Hàm cộng XP cho học viên (ví dụ khi làm xong bài tập luyện phát âm)
// Đồng thời cập nhật lastActive và streak để ghi nhận hoạt động học tập trong ngày
export const addXp = async (userId: string, xp: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createNotFoundError('User not found');
  }

  if (typeof xp !== 'number' || xp <= 0) {
    throw createBadRequestError('Invalid XP amount');
  }

  // Tính toán streak dựa trên khoảng cách ngày học
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDay = new Date(
    user.lastActive.getFullYear(),
    user.lastActive.getMonth(),
    user.lastActive.getDate()
  );
  const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = user.streak;
  if (diffDays === 0) {
    // Cùng ngày hôm nay -> Giữ nguyên streak (không cộng thêm)
    newStreak = user.streak === 0 ? 1 : user.streak;
  } else if (diffDays === 1) {
    // Ngày hôm sau liên tiếp -> Tăng streak
    newStreak = user.streak + 1;
  } else {
    // Bỏ học > 1 ngày -> Reset streak về 1 (hôm nay bắt đầu lại)
    newStreak = 1;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: user.xp + xp,
      lastActive: now,
      streak: newStreak
    }
  });

  const { password, ...userObj } = updatedUser;
  return userObj;
};

// Hàm lấy danh sách bảng xếp hạng (các người dùng có XP cao nhất)
export const getLeaderboard = async (limit: number) => {
  const users = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: limit
  });

  return users.map(user => {
    const { password, ...userObj } = user;
    return userObj;
  });
};
