'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications, AppNotification } from '../context/NotificationContext';

/**
 * Hiển thị thời gian tương đối dạng "Vừa xong", "2 phút trước"...
 */
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHr < 24) return `${diffHr} giờ trước`;
  return `${diffDay} ngày trước`;
}

/**
 * NotificationItem - Hiển thị một dòng thông báo trong dropdown
 */
function NotificationItem({ notification, onRead }: { notification: AppNotification; onRead: () => void }) {
  return (
    <button
      onClick={onRead}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-bright/50 transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${notification.bgClass} mt-0.5`}>
        <span
          className={`material-symbols-outlined text-[18px] ${notification.colorClass}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {notification.icon}
        </span>
      </div>

      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-black text-on-surface leading-tight ${!notification.read ? 'text-on-surface' : 'text-on-surface-variant/80'}`}>
          {notification.title}
        </p>
        <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-snug line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[9px] text-on-surface-variant/40 mt-1 font-bold uppercase tracking-wider">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Chấm chưa đọc */}
      {!notification.read && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
      )}
    </button>
  );
}

/**
 * NotificationBell - Icon chuông với badge đếm và dropdown danh sách thông báo.
 * Dùng được ở cả Sidebar Desktop và MobileHeader.
 */
export default function NotificationBell({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleReadOne = (id: string) => {
    markRead(id);
  };

  // Desktop: hiển thị theo chiều ngang trong sidebar
  // Mobile: hiển thị trong header
  const isDesktop = variant === 'desktop';

  return (
    <div className="relative">
      {/* Nút chuông */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`relative flex items-center justify-center rounded-xl transition-all ${
          isDesktop
            ? 'w-full gap-4 p-3 border-b-4 border-transparent hover:bg-surface-bright hover:translate-y-[-2px] text-on-surface-variant'
            : 'w-9 h-9 hover:bg-surface-bright/50'
        } ${isOpen ? 'bg-surface-bright' : ''}`}
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
      >
        <span
          className={`material-symbols-outlined text-2xl ${unreadCount > 0 ? 'text-primary' : ''}`}
          style={{ fontVariationSettings: isOpen ? "'FILL' 1" : "'FILL' 0" }}
        >
          notifications
        </span>

        {/* Badge số chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Label cho Desktop sidebar */}
        {isDesktop && (
          <span className="font-bold text-sm uppercase">THÔNG BÁO</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-[9998] w-80 rounded-2xl border-2 border-outline-variant/30 shadow-2xl overflow-hidden
            bg-surface-container
            ${isDesktop
              ? 'left-full top-0 ml-3'            // Desktop: bên phải sidebar
              : 'right-0 top-full mt-2'           // Mobile: xuống dưới header
            }
          `}
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
            <h4 className="font-black text-sm text-on-surface uppercase tracking-wide">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-primary font-black hover:underline"
                >
                  Đọc tất cả
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] text-on-surface-variant/50 font-bold hover:underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-outline-variant/10">
            {notifications.length === 0 ? (
              // Trạng thái rỗng
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <span
                  className="material-symbols-outlined text-5xl text-on-surface-variant/30"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  notifications_off
                </span>
                <p className="text-xs text-on-surface-variant/50 font-bold text-center px-4">
                  Không có thông báo nào.<br />
                  Hãy học bài để nhận thông báo nhé!
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={() => handleReadOne(notif.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
