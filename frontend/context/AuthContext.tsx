'use client';

import React, { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetUserProfile,
  apiUpdateUserProfile,
  apiLoseHeart,
  apiRefillHearts,
  apiAddXp
} from '../lib/api';

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  xp: number;
  hearts: number;
  lastHeartReset: string;
  streak: number;
  lastActive: string;
  avatar?: string;
  soundEffects?: boolean;
  animations?: boolean;
  motivationalMessages?: boolean;
  listeningExercises?: boolean;
  darkMode?: string;
  role?: string;
  xpHistory?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loseHeart: () => Promise<number>;
  refillHearts: () => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  addXp: (amount: number) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Truy vấn thông tin chi tiết user bằng TanStack Query.
   * - Trình duyệt sẽ tự động gửi kèm HttpOnly Cookie 'token' lên Next.js API.
   * - Nếu cookie hợp lệ, backend sẽ trả về thông tin user. Ngược lại trả về null.
   */
  const { data: user = null, isLoading: isUserQueryLoading } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await apiGetUserProfile();
      } catch (err) {
        // Trả về null khi chưa đăng nhập (API trả về 401 hoặc lỗi)
        return null;
      }
    },
    retry: false, // Không thử lại khi thất bại để tránh spam request lúc chưa đăng nhập
    staleTime: 1000 * 60 * 5, // Cache profile trong 5 phút
  });

  // Trạng thái loading của session được quyết định bởi quá trình fetch profile người dùng
  const loading = isUserQueryLoading;

  /**
   * Đăng ký tài khoản mới.
   * Cập nhật thông tin vào cache của queryClient để cập nhật giao diện lập tức.
   */
  const register = async (username: string, email: string, password: string) => {
    try {
      const data = await apiRegister(username, email, password);
      // Đồng bộ thông tin người dùng trực tiếp vào cache của React Query
      queryClient.setQueryData(['user'], data.user);
      router.push('/learn');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  /**
   * Đăng nhập tài khoản.
   * Cập nhật thông tin vào cache của queryClient để cập nhật giao diện lập tức.
   */
  const login = async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      // Đồng bộ thông tin người dùng trực tiếp vào cache của React Query
      queryClient.setQueryData(['user'], data.user);
      router.push('/learn');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  /**
   * Đăng xuất.
   * Gọi API xóa cookie ở BFF và làm sạch cache của React Query để bảo mật dữ liệu.
   */
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Lỗi khi gọi API đăng xuất:', err);
    } finally {
      // Xóa sạch tất cả các cache trong bộ đệm
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.setQueryData(['user'], null);
      router.push('/');
    }
  };

  /**
   * Thực hiện trừ đi 1 tim khi trả lời câu hỏi sai.
   * Đồng bộ ngay dữ liệu tim mới trả về vào cache.
   */
  const loseHeart = async (): Promise<number> => {
    if (!user) return 0;
    try {
      const data = await apiLoseHeart();
      queryClient.setQueryData(['user'], data.user);
      return data.hearts;
    } catch (err) {
      console.error('Error losing heart', err);
    }
    return user.hearts;
  };

  /**
   * Hồi phục tim bằng cách đổi 50 XP.
   * Đồng bộ ngay dữ liệu tim và XP mới trả về vào cache.
   */
  const refillHearts = async () => {
    if (!user) return { success: false, message: 'Not authenticated' };
    try {
      const data = await apiRefillHearts();
      queryClient.setQueryData(['user'], data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to refill hearts' };
    }
  };

  /**
   * Buộc làm mới dữ liệu người dùng (tải lại từ backend).
   */
  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  /**
   * Cập nhật thông tin profile/cài đặt.
   * Ghi đè bộ đệm ngay khi API thành công.
   */
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    try {
      const data = await apiUpdateUserProfile(updates);
      queryClient.setQueryData(['user'], data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update settings' };
    }
  };

  /**
   * Cộng XP sau khi hoàn thành bài học.
   * Ghi đè bộ đệm ngay khi API thành công.
   */
  const addXp = async (amount: number) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    try {
      const data = await apiAddXp(amount);
      queryClient.setQueryData(['user'], data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to add XP' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loseHeart,
        refillHearts,
        refreshUser,
        updateUser,
        addXp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
