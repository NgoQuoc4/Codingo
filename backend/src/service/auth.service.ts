import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { createBadRequestError, createUnauthorizedError } from '../utils/errors';

// Lấy khóa bí mật JWT từ biến môi trường hoặc sử dụng khóa dự phòng mặc định
const JWT_SECRET = process.env.JWT_SECRET || 'AntigravitySuperSecretDuolingoCodingPlatformSecretKey123';

// Hàm đăng ký người dùng mới
export const registerUser = async (username?: string, email?: string, password?: string) => {
  // 1. Kiểm tra tính hợp lệ của tham số đầu vào
  if (!username || !email || !password) {
    throw createBadRequestError('All fields are required');
  }

  // 2. Kiểm tra xem tên đăng nhập hoặc email đã tồn tại trong database chưa
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    throw createBadRequestError('Username or Email already in use');
  }

  // 3. Mã hóa mật khẩu người dùng với salt rounds là 10 để bảo mật thông tin
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Tạo bản ghi người dùng mới trong database MongoDB thông qua Prisma
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      xp: 0, // Điểm kinh nghiệm khởi tạo là 0
      hearts: 5, // Số tim ban đầu tối đa là 5
      lastHeartReset: new Date(), // Mốc thời gian hồi phục tim
      streak: 0, // Số ngày học liên tục khởi đầu
      lastActive: new Date()
    }
  });

  // 5. Ký nhận token JWT chứa userId để quản lý phiên làm việc của Client, hết hạn sau 7 ngày
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  // 6. Loại bỏ mật khẩu băm khỏi đối tượng trả về trước khi gửi phản hồi
  const { password: _, ...userObj } = user;

  return {
    token,
    user: userObj,
  };
};

// Hàm đăng nhập người dùng
export const loginUser = async (email?: string, password?: string) => {
  // 1. Kiểm tra tham số đầu vào
  if (!email || !password) {
    throw createBadRequestError('Email and password are required');
  }

  // 2. Tìm kiếm người dùng trong database theo địa chỉ email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createUnauthorizedError('Invalid credentials');
  }

  // 3. Kiểm tra xem mật khẩu người dùng nhập vào có khớp với mật khẩu băm trong DB không
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createUnauthorizedError('Invalid credentials');
  }

  // 4. Ký nhận token JWT khi đăng nhập thành công
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  // 5. Loại bỏ trường mật khẩu trước khi trả về dữ liệu người dùng
  const { password: _, ...userObj } = user;

  return {
    token,
    user: userObj,
  };
};
