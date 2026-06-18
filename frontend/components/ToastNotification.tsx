'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications, AppNotification } from '../context/NotificationContext';

const TOAST_DURATION_MS = 5000;

/**
 * SingleToast - Hiển thị một toast thông báo với thanh đếm ngược và animation
 */
function SingleToast({
  notification,
  onDismiss,
}: {
  notification: AppNotification;
  onDismiss: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Slide-in animation khi mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Countdown progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev - (100 / (TOAST_DURATION_MS / 100));
        if (next <= 0) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(), 350); // Đợi animation slide-out
  };

  return (
    <div
      className={`
        relative w-80 rounded-2xl border-2 shadow-2xl overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${notification.bgClass}
        ${visible && !leaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
        }
      `}
      style={{ backdropFilter: 'blur(12px)' }}
      onClick={handleClose}
    >
      {/* Nội dung chính */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notification.bgClass}`}>
          <span
            className={`material-symbols-outlined text-2xl ${notification.colorClass}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {notification.icon}
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-on-surface leading-tight">
            {notification.title}
          </p>
          <p className="text-[11px] text-on-surface-variant/80 mt-0.5 leading-snug">
            {notification.message}
          </p>
        </div>

        {/* Nút đóng X */}
        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-on-surface/10 transition-colors"
        >
          <span className="material-symbols-outlined text-base text-on-surface-variant/60">
            close
          </span>
        </button>
      </div>

      {/* Thanh đếm ngược tự động đóng */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-on-surface/10">
        <div
          className={`h-full transition-all ease-linear ${notification.colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
        />
      </div>
    </div>
  );
}

/**
 * ToastNotification - Container toàn cục hiển thị danh sách toast ở góc dưới phải màn hình.
 * Phải được đặt trong layout chính để luôn hiển thị.
 */
export default function ToastNotification() {
  const { toastQueue, dismissToast } = useNotifications();

  // Chỉ hiển thị tối đa 3 toast cùng lúc
  const visibleToasts = toastQueue.slice(0, 3);

  return (
    <div
      className="fixed bottom-24 md:bottom-6 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Thông báo"
    >
      {visibleToasts.map(notif => (
        <div key={notif.id} className="pointer-events-auto">
          <SingleToast
            notification={notif}
            onDismiss={() => dismissToast(notif.id)}
          />
        </div>
      ))}
    </div>
  );
}
