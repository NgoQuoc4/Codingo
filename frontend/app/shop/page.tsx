'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Navbar';
import Link from 'next/link';

export default function ShopPage() {
  const { token, user, loading: authLoading, refillHearts, refreshUser } = useAuth();
  const router = useRouter();

  const [shopMsg, setShopMsg] = useState('');
  const [shopError, setShopError] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login');
    }
  }, [token, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">Loading shop...</p>
      </div>
    );
  }

  const handleRefill = async () => {
    if (user.hearts >= 5) return;
    try {
      setShopMsg('');
      setShopError('');
      setLoadingAction(true);
      const res = await refillHearts();
      if (res.success) {
        setShopMsg('Nạp đầy trái tim thành công!');
        await refreshUser();
      } else {
        setShopError(res.message || 'Không đủ điểm XP để đổi (Cần 50 XP).');
      }
    } catch (e) {
      setShopError('Lỗi kết nối cửa hàng.');
    } finally {
      setLoadingAction(false);
    }
  };

  const dailyXp = user.xp % 20;
  const dailyProgressPercent = Math.min((dailyXp / 20) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* CENTER COLUMN: Main Shop Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* SUPER BANNER */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] p-6 border-b-4 border-black/30 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-24 h-24 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center animate-float">
                  <img
                    alt="Mascot"
                    className="w-16 h-16 object-contain pointer-events-none"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjWPiq_E3h8EZnIRWe2gQhZqK-a_XsDBozi4wCzGR6-GsJ3jijw89rMsA6CA-CUhXPvzWz9Gfdw23FDLuUPswI5X3qSwnk_n9BALNaWLg_MctsT48mSkvmasX2MJlxA3TLx-Dfm6NibjsS32owjTCkGZy3bnt1Ai_QqjqjLDB8wRrKIyFMQZeif8-MAXaxGWo0LLufB6okb4GHLuX3BB5yiLIsKAyfxuYqMAlsStykDAhQHkm_PklxExAMA089gc7InvdugPAQKChF"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <span className="inline-block bg-white text-[#4A00E0] px-3 py-1 rounded-full font-button text-[10px] tracking-widest uppercase">
                    SIÊU CẤP
                  </span>
                  <h2 className="font-headline-md text-xl md:text-2xl leading-tight">
                    Mở khóa tính năng Premium ngay!
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm font-medium">
                    Nhận mạng vô hạn, chặn quảng cáo, và mở khóa lộ trình học đặc quyền.
                  </p>
                </div>
              </div>
              <button className="mt-6 w-full bg-white text-on-surface font-button py-3.5 rounded-2xl border-b-4 border-gray-300 flat-3d-button active-3d-button uppercase text-sm tracking-wider font-black">
                BẮT ĐẦU 7 NGÀY DÙNG THỬ MIỄN PHÍ
              </button>
            </section>

            {/* Shop Notifications */}
            {shopMsg && (
              <div className="bg-secondary-container/10 border-2 border-secondary text-secondary p-4 rounded-2xl text-sm font-bold text-center">
                {shopMsg}
              </div>
            )}
            {shopError && (
              <div className="bg-brand-red/10 border-2 border-brand-red text-brand-red p-4 rounded-2xl text-sm font-bold text-center">
                {shopError}
              </div>
            )}

            {/* Trái tim Section */}
            <section className="space-y-4">
              <h3 className="font-headline-md text-lg text-on-surface uppercase tracking-wide">Mạng / Trái tim</h3>
              <div className="space-y-3">
                {/* Item 1: Refill Hearts */}
                <div className="bg-surface-container rounded-3xl p-5 border-b-4 border-black/20 flex items-center gap-4 shadow-sm">
                  <div className="w-14 h-14 flex items-center justify-center bg-brand-red/10 rounded-2xl text-brand-red">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-body-lg text-sm md:text-base text-on-surface font-bold">Hồi phục Trái tim</h4>
                    <p className="text-on-surface-variant text-xs mt-0.5">Lấp đầy trái tim để tiếp tục các bài học.</p>
                  </div>
                  {user.hearts >= 5 ? (
                    <button
                      disabled
                      className="bg-surface-variant text-outline font-button px-5 py-2.5 rounded-xl border-b-4 border-black/10 cursor-not-allowed uppercase text-xs"
                    >
                      ĐẦY ĐỦ
                    </button>
                  ) : (
                    <button
                      onClick={handleRefill}
                      disabled={loadingAction}
                      className="bg-secondary text-on-secondary font-button px-5 py-2.5 rounded-xl border-b-4 border-on-secondary-fixed-variant flat-3d-button active-3d-button uppercase text-xs font-black"
                    >
                      {loadingAction ? 'Đang mua...' : 'Mua • 50 XP'}
                    </button>
                  )}
                </div>

                {/* Item 2: Infinite Hearts */}
                <div className="bg-surface-container rounded-3xl p-5 border-b-4 border-black/20 flex items-center gap-4 shadow-sm">
                  <div className="w-14 h-14 flex items-center justify-center bg-brand-purple/10 rounded-2xl text-brand-purple">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      all_inclusive
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-body-lg text-sm md:text-base text-on-surface font-bold">Mạng vô hạn</h4>
                      <span className="text-[#FF4BBD] text-[10px] font-black uppercase bg-[#FF4BBD]/10 px-2 py-0.5 rounded-md">
                        Premium
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-xs mt-0.5">Không bao giờ lo lắng về việc hết mạng học tập.</p>
                  </div>
                  <button className="bg-secondary text-on-secondary font-button px-5 py-2.5 rounded-xl border-b-4 border-on-secondary-fixed-variant flat-3d-button active-3d-button uppercase text-xs font-black">
                    Nhận
                  </button>
                </div>
              </div>
            </section>

            {/* Tăng sức mạnh Section */}
            <section className="space-y-4">
              <h3 className="font-headline-md text-lg text-on-surface uppercase tracking-wide">Tăng sức mạnh</h3>
              <div className="bg-surface-container rounded-3xl p-5 border-b-4 border-black/20 space-y-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-brand-blue/10 rounded-2xl text-brand-blue">
                    <span className="material-symbols-outlined text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                      ac_unit
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="font-body-lg text-sm md:text-base text-on-surface font-bold">Streak Freeze</h4>
                      <span className="bg-primary/20 text-primary-fixed-dim px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border border-primary/30">
                        Đã sở hữu
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                      Streak Freeze cho phép bạn bỏ lỡ một ngày luyện tập mà không bị mất chuỗi hoạt động Streak của mình.
                    </p>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full bg-surface-variant text-outline font-button py-3 rounded-2xl border-b-4 border-black/10 cursor-not-allowed uppercase text-xs font-black"
                >
                  ĐÃ ĐƯỢC TRANG BỊ
                </button>
              </div>
            </section>

          </div>
        </main>

        {/* COLUMN 3: Right Status & Widgets panel */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar">
          
          {/* Stats Header */}
          <div className="flex items-center justify-between p-2 bg-surface-container rounded-2xl border-b-4 border-black/20">
            <Link href="/quests" className="flex items-center gap-1.5 hover:bg-surface-bright px-2.5 py-1.5 rounded-xl transition-all active:translate-y-0.5">
              <span className="material-symbols-outlined text-brand-orange text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-black text-sm">{user.streak}</span>
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-primary font-black">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                award
              </span>
              <span className="font-black text-sm">{user.xp}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-brand-red font-black">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="font-black text-sm">{user.hearts}</span>
            </div>
          </div>

          {/* Widgets Stack */}
          <div className="flex flex-col gap-6">
            
            {/* Widget 1: Daily Quests */}
            <div className="bg-surface-container rounded-3xl p-5 border-b-4 border-black/20 space-y-4 shadow-md">
              <div className="flex justify-between items-center">
                <h4 className="font-headline-md text-base leading-tight">Nhiệm vụ hằng ngày</h4>
                <span className="material-symbols-outlined text-brand-yellow font-black">bolt</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-on-surface">Kiếm 20 EXP</span>
                    <span className="text-secondary">{dailyXp}/20</span>
                  </div>
                  <div className="w-full h-3.5 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{ width: `${dailyProgressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Partners / Sponsors */}
            <div className="bg-surface-container rounded-3xl p-5 border-b-4 border-black/20 space-y-4 shadow-md">
              <h4 className="font-headline-md text-base leading-tight">Nhà tài trợ</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-video bg-white rounded-xl flex items-center justify-center p-2">
                  <span className="text-gray-500 font-extrabold text-[10px] tracking-wider uppercase">TECH CORP</span>
                </div>
                <div className="aspect-video bg-white rounded-xl flex items-center justify-center p-2">
                  <span className="text-emerald-500 font-extrabold text-[10px] tracking-wider uppercase">STUDY GO</span>
                </div>
                <div className="aspect-video bg-white rounded-xl flex items-center justify-center p-2">
                  <span className="text-orange-500 font-extrabold text-[10px] tracking-wider uppercase">FOCUS HUB</span>
                </div>
                <div className="aspect-video bg-white rounded-xl flex items-center justify-center p-2">
                  <span className="text-purple-500 font-extrabold text-[10px] tracking-wider uppercase">ZEN GAMES</span>
                </div>
              </div>
            </div>

          </div>

        </aside>

      </div>
    </div>
  );
}
