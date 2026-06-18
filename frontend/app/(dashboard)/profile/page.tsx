'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

/**
 * ProfilePage hiển thị thông tin chi tiết của người dùng như tên, email, avatar, 
 * thống kê các chỉ số (streak, XP, cup, bảng đấu hiện tại) và danh sách thành tựu đạt được.
 */
export default function ProfilePage() {
  // Lấy dữ liệu và trạng thái xác thực từ AuthContext
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State cục bộ phục vụ việc chuyển đổi tab Đang theo dõi / Người theo dõi ở sidebar phụ
  const [activeSocialTab, setActiveSocialTab] = useState<'following' | 'followers'>('following');

  // Trả về giao diện trống nếu người dùng chưa tải xong thông tin profile
  if (!user) return null;

  // Tính toán phần trăm tiến độ của thành tích Streak (Mục tiêu: chuỗi 75 ngày)
  const streakGoal = 75;
  const streakProgressPercent = Math.min((user.streak / streakGoal) * 100, 100);

  // Tính toán phần trăm tiến độ của thành tích tích lũy kinh nghiệm (Mục tiêu: 7500 XP)
  const xpGoal = 7500;
  const xpProgressPercent = Math.min((user.xp / xpGoal) * 100, 100);

  return (
    <>
        {/* CENTER COLUMN: Khung chính hiển thị thông tin chi tiết user */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">

          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Profile Banner */}
            <div className="relative mb-12">
              <div className="h-44 w-full bg-surface-container-high rounded-3xl border-b-4 border-black/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#dfe2f3 1px, transparent 1px)", backgroundColor: '#171b28', backgroundSize: '20px 20px' }}></div>
              </div>
              
              {/* Avatar picture */}
              <div className="absolute -bottom-10 left-6">
                <div className="w-28 h-28 rounded-full border-8 border-background bg-surface-bright overflow-hidden shadow-lg relative group">
                  <img
                    src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiIcZrqBjissZ0lmZIA-nyKbvY-D82bJ6mJ8J8rkNI357xJbE9pTlH96D2fG23jtsxJE-e-xpFn4FlMqvERx_Z3xMMIPdJqpy3HR0LV8W7sdE-uv-zKqRVVpJeHEn4EJQQdCjQE1hk4b-Jwgc7rhRgwtY71KRBbjDLnmXt6oDSWm2e-D1-yXq5MXgjUuJ6U1f9lR6QiXv_nTGYIAjippDKnm5DoMpcMX6jPFoiJt9h-XaP4HoI2y18Lm7WqEZ6cwJTNoD4Vu3LjqdO'}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <button
                    onClick={() => router.push('/settings')}
                    className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full border-4 border-background pop-button shadow-md"
                  >
                    <span className="material-symbols-outlined text-xs">edit</span>
                  </button>
                </div>
              </div>

              {/* Edit Profile Action button */}
              <div className="absolute -bottom-4 right-0">
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 bg-surface-bright border-b-4 border-black/30 rounded-2xl font-button text-xs hover:bg-surface-variant transition-all active:translate-y-0.5 active:border-b-0 uppercase font-black"
                >
                  CHỈNH SỬA HỒ SƠ
                </button>
              </div>
            </div>

            {/* Profile User Info tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-lg text-2xl font-black text-on-surface leading-tight">
                  {user.username}
                </h2>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20">🇺🇸</span>
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20">💻</span>
                  <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-black rounded-lg border border-tertiary/20">👑</span>
                </div>
              </div>
              <p className="font-body-md text-on-surface-variant/70 text-xs">@{user.username} • {user.email}</p>
              
              <div className="flex items-center gap-4 text-on-surface-variant text-xs font-bold flex-wrap pt-1">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>Đã tham gia tháng 4 năm 2026</span>
                </div>
                <div className="flex gap-3">
                  <span className="hover:underline cursor-pointer"><strong className="text-on-surface font-black">0</strong> Đang theo dõi</span>
                  <span className="hover:underline cursor-pointer"><strong className="text-on-surface font-black">0</strong> Người theo dõi</span>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/20" />

            {/* Statistics Section Grid */}
            <section className="space-y-4">
              <h3 className="font-headline-md text-base md:text-lg">Thống kê tiến độ</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Streak card */}
                <div className="bg-surface-container p-4 rounded-3xl border-2 border-outline-variant/30 flex items-center gap-3 relative overflow-hidden">
                  <div className="w-10 h-10 flex items-center justify-center text-orange-500">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      local_fire_department
                    </span>
                  </div>
                  <div>
                    <p className="font-headline-md text-lg text-on-surface">{user.streak}</p>
                    <p className="font-label-lg text-on-surface-variant/60 uppercase tracking-wide text-[10px]">Ngày streak</p>
                  </div>
                </div>

                {/* Total XP card */}
                <div className="bg-surface-container p-4 rounded-3xl border-2 border-outline-variant/30 flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      bolt
                    </span>
                  </div>
                  <div>
                    <p className="font-headline-md text-lg text-on-surface">{user.xp}</p>
                    <p className="font-label-lg text-on-surface-variant/60 uppercase tracking-wide text-[10px]">Tổng điểm KN</p>
                  </div>
                </div>

                {/* Active League rank card */}
                <div className="bg-surface-container p-4 rounded-3xl border-2 border-outline-variant/30 flex items-center gap-3 relative">
                  <div className="w-10 h-10 flex items-center justify-center text-[#FF79C6]">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      diamond
                    </span>
                  </div>
                  <div>
                    <p className="font-headline-md text-base text-on-surface">Ngọc Trai</p>
                    <p className="font-label-lg text-on-surface-variant/60 uppercase tracking-wide text-[10px]">Giải đấu hiện tại</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-[#FF79C6] text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
                    TUẦN 1
                  </div>
                </div>

                {/* Star wins trophies card */}
                <div className="bg-surface-container p-4 rounded-3xl border-2 border-outline-variant/30 flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      emoji_events
                    </span>
                  </div>
                  <div>
                    <p className="font-headline-md text-lg text-on-surface">1</p>
                    <p className="font-label-lg text-on-surface-variant/60 uppercase tracking-wide text-[10px]">Số lần đạt top 3</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Achievements progress sliders */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-base md:text-lg">Thành tích đạt được</h3>
              </div>
              
              <div className="space-y-4">
                {/* Lửa Rừng streak achievement */}
                <div className="bg-surface-container p-5 rounded-3xl border-2 border-outline-variant/30 flex items-center gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red border-b-4 border-brand-red/20 shrink-0">
                    <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="font-bold text-sm text-on-surface truncate">Lửa rừng</h4>
                      <span className="text-xs font-black text-on-surface-variant shrink-0">{user.streak} / {streakGoal}</span>
                    </div>
                    {/* Progress Slider */}
                    <div className="h-3.5 w-full bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/20 p-0.5">
                      <div
                        className="h-full bg-brand-red transition-all duration-500 shadow-[0_0_8px_rgba(255,180,171,0.5)] rounded-full"
                        style={{ width: `${streakProgressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant/70 mt-1.5">Đạt chuỗi 75 ngày streak liên tục</p>
                  </div>
                </div>

                {/* Cao Nhân XP achievement */}
                <div className="bg-surface-container p-5 rounded-3xl border-2 border-outline-variant/30 flex items-center gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary border-b-4 border-secondary/20 shrink-0">
                    <span className="material-symbols-outlined text-3xl">auto_fix_high</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="font-bold text-sm text-on-surface truncate">Cao nhân</h4>
                      <span className="text-xs font-black text-on-surface-variant shrink-0">{user.xp} / {xpGoal}</span>
                    </div>
                    {/* Progress Slider */}
                    <div className="h-3.5 w-full bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/20 p-0.5">
                      <div
                        className="h-full bg-secondary transition-all duration-500 shadow-[0_0_8px_rgba(115,233,48,0.5)] rounded-full"
                        style={{ width: `${xpProgressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant/70 mt-1.5">Tích lũy tổng điểm kinh nghiệm đạt 7500 XP</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>

        {/* COLUMN 3: Right Status & Social panel */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar">
          
          {/* Status Header */}
          <div className="flex items-center justify-between bg-surface-container p-2 rounded-2xl border-b-4 border-black/20">
            <div className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-black text-sm">{user.streak}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <span className="font-black text-sm">{user.xp}</span>
            </div>
            <div className="flex items-center gap-1 text-brand-red">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="font-black text-sm">{user.hearts}</span>
            </div>
          </div>

          {/* Social connections Card tab */}
          <div className="bg-surface-container rounded-3xl border-2 border-outline-variant/30 overflow-hidden shadow-md">
            <div className="flex border-b border-outline-variant/20">
              <button
                onClick={() => setActiveSocialTab('following')}
                className={`flex-1 py-3 text-xs font-black uppercase transition-colors ${
                  activeSocialTab === 'following'
                    ? 'text-on-surface border-b-2 border-primary bg-[#1e2332]/30'
                    : 'text-on-surface-variant/60 hover:bg-surface-bright'
                }`}
              >
                ĐANG THEO DÕI
              </button>
              <button
                onClick={() => setActiveSocialTab('followers')}
                className={`flex-1 py-3 text-xs font-black uppercase transition-colors ${
                  activeSocialTab === 'followers'
                    ? 'text-on-surface border-b-2 border-primary bg-[#1e2332]/30'
                    : 'text-on-surface-variant/60 hover:bg-surface-bright'
                }`}
              >
                NGƯỜI THEO DÕI
              </button>
            </div>
            <div className="p-5 text-center space-y-4">
              <div className="w-28 h-28 mx-auto opacity-70 animate-float">
                <img
                  className="w-full h-full object-contain pointer-events-none"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOEqp0M5Wb4ySbK7b6YcEc1wYRNHJTchYEfJ7iFMK82L-B5XA0v1uQ0ufo3oHaa8kswG8j8om-z1j0eFGldfuZCo31A2vsUhuEh98XmKpvEQu2QW2gpCB8EgmbXeeiKWKzrqSNH_vHPc6q4wtG3ez7VCrgMV2dkcDDd4W5QuHNVaMPsr6UD80dhd08FwerNq__Anzqd-DcjUaEInmQMUzm7gUXvAfF8GwntnvY0Zwdwjcnv7QTWWVPeCf1tSIYkpnLyMIn-nLKW_Pc"
                  alt="Social Friends"
                />
              </div>
              <p className="text-xs font-bold text-on-surface-variant/80 leading-relaxed">
                Kết nối bạn bè giúp học tập và thi đấu bảng xếp hạng thú vị hơn!
              </p>
            </div>
          </div>

          {/* Social actions button list */}
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border-b-4 border-black/30 hover:bg-surface-bright transition-all active:translate-y-0.5 active:border-b-0 group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">person_search</span>
                <span className="font-button text-xs text-on-surface">TÌM KIẾM BẠN BÈ</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
            <button className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border-b-4 border-black/30 hover:bg-surface-bright transition-all active:translate-y-0.5 active:border-b-0 group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">mail</span>
                <span className="font-button text-xs text-on-surface">MỜI GỌI BẠN BÈ</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
          </div>

        </aside>
    </>
  );
}
