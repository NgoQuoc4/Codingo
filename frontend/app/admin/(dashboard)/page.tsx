'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalPractices: number;
  totalCourses: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function OverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError('Không thể tải thống kê từ máy chủ');
      }
    } catch (err) {
      setError('Lỗi kết nối khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
            refresh
          </span>
        </div>
      ) : error ? (
        <p className="text-xs text-brand-red font-bold">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
          {/* Stats Users Card */}
          <div className="bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 flex items-center gap-5 hover:scale-[1.02] transition-transform">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/25">
              <span className="material-symbols-outlined text-3xl font-black">group</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">
                TỔNG HỌC VIÊN
              </p>
              <p className="text-3xl font-black text-on-surface">
                {stats?.totalUsers || 0}
              </p>
            </div>
          </div>

          {/* Stats Theory Card */}
          <div className="bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 flex items-center gap-5 hover:scale-[1.02] transition-transform">
            <div className="w-14 h-14 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center border border-pink-500/25">
              <span className="material-symbols-outlined text-3xl font-black">menu_book</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">
                BÀI LÝ THUYẾT
              </p>
              <p className="text-3xl font-black text-on-surface">
                {stats?.totalCourses || 0}
              </p>
            </div>
          </div>

          {/* Stats Practices Card */}
          <div className="bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 flex items-center gap-5 hover:scale-[1.02] transition-transform">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/25">
              <span className="material-symbols-outlined text-3xl font-black">map</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">
                LỘ TRÌNH THỰC HÀNH
              </p>
              <p className="text-3xl font-black text-on-surface">
                {stats?.totalPractices || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
