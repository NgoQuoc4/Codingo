'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Navbar';

/**
 * DashboardLayout là Layout chung cho toàn bộ các trang nằm trong dashboard (ví dụ: /learn, /profile, /leaderboard,...).
 * Nó thực hiện cơ chế bảo vệ định tuyến (Route Guard) để kiểm tra đăng nhập và tự động hiển thị Sidebar điều hướng.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Route protection: Bảo vệ định tuyến - Tự động đẩy người dùng về trang đăng nhập (/login)
  // nếu họ chưa được xác thực (không có user) sau khi hoàn tất tải thông tin.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Trong thời gian đang tải hoặc chưa nạp xong thông tin người dùng,
  // hiển thị màn hình chờ (loading screen) với hiệu ứng spin xoay tròn.
  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative">
      {/* Sidebar điều hướng chính ở Desktop hoặc Header/Footer ở giao diện Mobile */}
      <Sidebar />
      
      {/* Main Content Layout Container: Khung chứa nội dung chính của từng trang dashboard */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}

