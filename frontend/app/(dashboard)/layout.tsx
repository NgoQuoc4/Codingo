'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { NotificationProvider, useNotifications, createStreakReminderNotification } from '../../context/NotificationContext';
import Sidebar from '../../components/Navbar';
import ToastNotification from '../../components/ToastNotification';

/**
 * StreakReminderGuard - Kiểm tra và kích hoạt thông báo nhắc nhở streak nếu user chưa học hôm nay.
 * Tách thành component riêng để có thể sử dụng useNotifications hook sau khi đã wrap trong NotificationProvider.
 */
function StreakReminderGuard() {
  const { user } = useAuth();
  const { addNotification, notifications } = useNotifications();
  const reminderSentRef = useRef(false);

  useEffect(() => {
    if (!user || reminderSentRef.current) return;

    // Tính ngày hôm nay theo múi giờ Việt Nam (UTC+7)
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const todayStr = nowVN.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Kiểm tra lastActive của user
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    const lastActiveVN = lastActive
      ? new Date(lastActive.getTime() + 7 * 60 * 60 * 1000)
      : null;
    const lastActiveStr = lastActiveVN?.toISOString().split('T')[0];

    // Nếu user có streak > 0 và chưa hoạt động hôm nay → nhắc nhở
    const hasStreak = user.streak > 0;
    const notLearnedToday = lastActiveStr !== todayStr;
    const alreadySentReminder = notifications.some(n => n.type === 'streak_reminder');

    if (hasStreak && notLearnedToday && !alreadySentReminder) {
      reminderSentRef.current = true;
      // Delay nhỏ để không block render đầu tiên
      const timer = setTimeout(() => {
        addNotification(createStreakReminderNotification());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, addNotification, notifications]);

  return null;
}

/**
 * DashboardLayoutInner - Layout chính sau khi đã có NotificationProvider.
 */
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Route protection: Tự động đẩy người dùng về trang đăng nhập nếu chưa xác thực
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Màn hình chờ trong khi xác thực
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
      {/* Streak Reminder Logic */}
      <StreakReminderGuard />

      {/* Sidebar điều hướng chính */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        {children}
      </div>

      {/* Toast thông báo toàn cục - luôn nằm trên cùng */}
      <ToastNotification />
    </div>
  );
}

/**
 * DashboardLayout - Layout chung cho tất cả trang dashboard.
 * Bọc NotificationProvider ở ngoài cùng để các component con có thể dùng useNotifications().
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </NotificationProvider>
  );
}
