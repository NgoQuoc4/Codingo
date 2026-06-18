'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// Các loại thông báo hỗ trợ
export type NotificationType =
  | 'streak_reminder'    // Nhắc chưa học hôm nay
  | 'streak_milestone'   // Đạt cột mốc streak (7, 30, 75 ngày...)
  | 'xp_milestone'       // Đạt cột mốc XP (100, 500, 1000...)
  | 'daily_goal'         // Đạt mục tiêu XP hàng ngày
  | 'heart_refill'       // Tim đã được nạp lại đầy
  | 'general';           // Thông báo chung

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;           // Material Symbol icon name
  colorClass: string;     // Tailwind color class cho icon
  bgClass: string;        // Tailwind class cho background card
  createdAt: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  toastQueue: AppNotification[];        // Queue cho toast popup
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider quản lý toàn bộ danh sách thông báo và toast queue toàn cục.
 * Wrap vào DashboardLayout để thông báo hoạt động trên tất cả trang dashboard.
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toastQueue, setToastQueue] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date(),
        read: false,
      };

      // Thêm vào danh sách thông báo chính
      setNotifications(prev => [newNotification, ...prev]);
      // Thêm vào queue để toast hiển thị
      setToastQueue(prev => [...prev, newNotification]);
    },
    []
  );

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Xóa toast đầu tiên trong queue (sau khi hiển thị xong)
  const dismissToast = useCallback((id: string) => {
    setToastQueue(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setToastQueue([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toastQueue,
        unreadCount,
        addNotification,
        markAllRead,
        markRead,
        dismissToast,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// ─── Preset helper functions để tạo thông báo nhanh ───────────────────────────

export const createStreakReminderNotification = () => ({
  type: 'streak_reminder' as NotificationType,
  title: '🔥 Streak đang nguy hiểm!',
  message: 'Bạn chưa học hôm nay. Hãy hoàn thành 1 bài ngay để giữ streak nhé!',
  icon: 'local_fire_department',
  colorClass: 'text-orange-400',
  bgClass: 'bg-orange-500/10 border-orange-500/30',
});

export const createStreakMilestoneNotification = (days: number) => ({
  type: 'streak_milestone' as NotificationType,
  title: `🏆 Chuỗi ${days} ngày!`,
  message: `Tuyệt vời! Bạn đã duy trì chuỗi học tập ${days} ngày liên tiếp. Tiếp tục nhé!`,
  icon: 'emoji_events',
  colorClass: 'text-amber-400',
  bgClass: 'bg-amber-500/10 border-amber-500/30',
});

export const createXpMilestoneNotification = (xp: number) => ({
  type: 'xp_milestone' as NotificationType,
  title: `⚡ Đạt ${xp} XP!`,
  message: `Bạn đã tích lũy được ${xp} điểm kinh nghiệm. Một bước tiến lớn trên hành trình coding!`,
  icon: 'bolt',
  colorClass: 'text-blue-400',
  bgClass: 'bg-blue-500/10 border-blue-500/30',
});

export const createDailyGoalNotification = () => ({
  type: 'daily_goal' as NotificationType,
  title: '🎯 Đạt mục tiêu hôm nay!',
  message: 'Bạn đã kiếm được ≥ 20 XP hôm nay. Mục tiêu ngày hôm nay đã hoàn thành!',
  icon: 'task_alt',
  colorClass: 'text-emerald-400',
  bgClass: 'bg-emerald-500/10 border-emerald-500/30',
});
