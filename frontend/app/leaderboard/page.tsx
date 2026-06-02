'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Navbar';
import Link from 'next/link';

interface LeaderboardUser {
  name: string;
  avatar: string;
  title: string;
  xp: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [selectedEmoji, setSelectedEmoji] = useState('😎');
  const [userEmoji, setUserEmoji] = useState('😎');

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
        <p className="font-extrabold text-on-surface-variant/80">Loading arena...</p>
      </div>
    );
  }

  // Create list of competitors and merge current user dynamically
  const competitors: LeaderboardUser[] = [
    { name: 'Linh Phù Thủy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEDybp8woOE-LfDAjhot03ekmooWr-Gq_fXvs44eHotIr54kTj3VFxtUWYKfBw0WKbiRcTya4EShnxJSdlGMwHgVByH0D-8KdDy0XkbMTEZxRl7Z-0-Hw4LwUm8lsdgz1Es4mTPvQePoFu-l3JkESa-9i4apEqho6yjHyHenk7CTG0n2vvtPVmymH8lQ-Gpt952YDBiUYISRiM4Km-gNhbxgZGYR2X2gJ9t_YQCPfrscBwqZOp17cOW5E0zI7ZSY-_tYazppeMnXEt', title: 'Huyền thoại tập trung', xp: 1240 },
    { name: 'Kiếm Sĩ Solo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGEWd9g_sEkH4ENsNqwI37IgkOuhP5K8VGv_uVTVUqFY48YyBhGKqd1WTP8G0Sx_qjjvkCJtg__raSfODO453SvOH6qZupezg7P4hSUsie2UOWPAu3TTq3fLP7x1qvHYee63tKgmoLCQ_DHtV4b1GldMW0BMpCv_xdemHi14FQtOFlZbGvX3RkkewU8DRXN_kRu-ztdn7u6sesLeFZ1pGCnvvzQNj5YpfHF074fAGONHHV4W3Rh6xhUJnLRsQa1lJTp6SCDFWdDbyx', title: 'Thành viên từ 2023', xp: 980 },
    { name: 'Cung Thủ Xanh', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb6EvLFy2iOWUIzNOmvGR0o78AS0RVCHBuBwr0R1c9H3C2iIf0wyrps3b3mQ4okctXG3EFVJLPNQr27_a_LQI2g-_5cgA216cMPHqB8vx-i2SkbjE26DsbBuKh-2gveDkOH9hzEXLnD1k2CDhhkXSwYcsUO2ztnZFcyZeAWCWU2W5If44FrKKuiZk51Li4v01bqKYQR2_93bd-0M06arGbg2Emd5SKtGHoi8zS53YtVKz_XfcHVVgSqsQfbGdvHneEl22MOqUTP7WT', title: 'Xạ thủ học tập', xp: 850 },
    { name: 'Mèo Chăm Chỉ', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBFgiS2TyEtMXTacK75E0_DLPdcxwtjgnsKetrYnpPCAxdHqJeCT56LSV2XfMZvOrn58v85Tn2hV65LcTG3U8zM45tt87Dtyb8rlMcNOAy-YS8QSLNKxZYRVp3euW-xf8p8N0MCpGbPFccKoGcXka9ajlKLgIE7mKGq31Rjf3YHJnn3AqHmKQ7EZtDg4tOGoHIrBdLVZ-4PD34dV43G05TvU72wJVVOGI7cPBwEBsalz_cB8rocivXStNaI8iDrpzOnul9Iz1w6HMf', title: 'Level 10 Student', xp: 720 },
    { name: 'Rồng Tập Trung', avatar: '', title: 'Focus Dragon', xp: 640 },
    { name: 'Sói Code', avatar: '', title: 'TypeScript Alpha', xp: 520 },
    { name: 'Phượng Hoàng', avatar: '', title: 'Never Give Up', xp: 480 },
    { name: 'Thỏ Thông Thái', avatar: '', title: 'Quiz Master', xp: 380 },
    { name: 'Rùa Kiên Trì', avatar: '', title: 'Slow But Steady', xp: 260 },
  ];

  const currentUserItem: LeaderboardUser = {
    name: user.username,
    avatar: user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiIcZrqBjissZ0lmZIA-nyKbvY-D82bJ6mJ8J8rkNI357xJbE9pTlH96D2fG23jtsxJE-e-xpFn4FlMqvERx_Z3xMMIPdJqpy3HR0LV8W7sdE-uv-zKqRVVpJeHEn4EJQQdCjQE1hk4b-Jwgc7rhRgwtY71KRBbjDLnmXt6oDSWm2e-D1-yXq5MXgjUuJ6U1f9lR6QiXv_nTGYIAjippDKnm5DoMpcMX6jPFoiJt9h-XaP4HoI2y18Lm7WqEZ6cwJTNoD4Vu3LjqdO',
    title: 'Bạn đang cố gắng!',
    xp: user.xp,
    isCurrentUser: true,
  };

  // Merge and sort
  const allStandings = [...competitors, currentUserItem].sort((a, b) => b.xp - a.xp);

  const emojis = ['😎', '🎉', '💪', '🇻🇳', '🔥', '😴', '📚', '🍀'];

  const getRankMedal = (rank: number) => {
    if (rank === 1) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVfPbrRfceeFWU51xlsqpU4TmJBs0cIE_f4TOVNsCWPxujIkxSFtEdEhJyFwf_L5HQo5zmmB643jYw9u2EQ7_GuV2mT82XVO_GpLEkqSm3mEURqhjnEkRX6S09wP-EoIsLZMZBwoQQce-IlKAmRDTMPlW3aZq5Hy_OZ_CgSndTXRJIiQf1WigJneCqRg3ljCL8UfBohgfckiRm6Zo_2m0Fg9vdJQaX1pKQtbxV-2MM3yPagr7LGv5ouTUW1LX1Rd-xKPHBCj9_fexL';
    if (rank === 2) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENuka4xhTqouMcPYFkFWRNnZFhpYzmGwJpMkK_70rzbizX1-KjfvDrjS9Fty1BqeGalyxoPUtwtvCt6jeEwWP_c78mEw4NpOYIbKxuQx-KugJMHcAzwYGTyqRyriO0-TwK8B6h-10sG31tI2qGiO-ygcNEsx879tP3af-PKFCPh7AmM6Udq9fS2mmhqyCIpSfWGMj7-MWHwYIVKKZ3RER_G9_83n4rF9uoNFS9fvBjteBKIQ3_vv_tcnIn7fHEZ8G8TJnB29WUh4q';
    if (rank === 3) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-ilbfuePbLgeDuX8PXvj0ByTl2PmEe3e6XptM5TD3wb60dZJk2QUtq9v3Ke-i2IM2e7qoHRqPFpeSIeathKf4AN204yokGf9phAiLm-ic6FvmgZkUGaqvriM127b0vMcy-VCUmvQMvjw72xuUBZHUn5ofeRwy3VtecNMDjq0K5_fKpuVzlqpsVnP9mz3YuO6hbivfhgN9Mj0bL0h5ber0viq4j4Z62f1LxhV9ooS_FeHHe997UG04oPzm-IzLLuFR4arWDXH89WQW';
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      <Sidebar />

      {/* Main Content Offset */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* CENTER COLUMN: Leaderboard Arena */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-10">
            
            {/* Arena Header with League Medal */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-end justify-center gap-4 mb-4 select-none">
                <img
                  className="w-14 h-14 opacity-30 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACMYhKgUbospGc91rEQSBREG4l3p9gi8Y2UshCcg0WIVo7-102K_zagiB4S4uTQDcAqLUF2Wvpt97QqfzIJqkmVgG1hiP1xZfGUuZRUg_oO7kUQuO2DUQgBURUb4sM8P2QN-4yq4SeQupsu4TQF75ibNMfCnzPJf3oJ8iDw3J04xCxeiCyFfXfaOhSnP3VORAxXzdIEhOB8ii0Hmenbl92v1evdxcgr4aQgkga_R3L6QWBro6X24l-aE6lDrYmVMZCZRk1EEfglLkC"
                  alt="Bronze"
                />
                <img
                  className="w-16 h-16 opacity-50 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAJvQ0NrtvwDQCSX7LjJO6mVAsWVFa2hBL4eHtHuR9IEa17j95qyLx1NOrGzrqD5QcUbP0ljH-wylZVWZhh86R0hTYxZ5CHgK0QjhxTx93PnaqauqFyKpN8wRMwYgAQzEYwlWe6TMAh0B5FVIT3xDL40TkAVqsCe1WDaWOr_m0c-LIUkhRUEzPhEQjGY-bHzUqhl9C5iA8AQtOb3cLGpyK2Di9vcrvlcLilmFNhIVu0TeoBT38UOz_jk1eloWUGVj4xfZVwE9DL_dS"
                  alt="Silver"
                />
                <div className="relative group">
                  <div className="absolute -inset-4 bg-magenta-500/20 blur-xl rounded-full pearl-glow"></div>
                  <img
                    className="w-28 h-28 relative z-10 pearl-glow transform transition-transform group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR59mbLwEeBNmJ0svPpD3emaUYdUx4OVZDrJkttznOl1lyJ2FwlL4WRaGN4F4U_LxDxEjZnHGSeuggWbBY8hf7aGl6AufSElCxrepL1lBsJhCUrqTtZvLTZh4f9eIEVFFBk5qFvGPDIZlYq0tSkeS4xuNNnbNTyEUhqsWacj1p3KdMJ9CMrx8fxxzRB9N69VmbhGkr0uPMtIJ_sDfs54NXFMO9dfQnEhjD0kYIPBpqsJmtCgM1t1Toe96FTWIy5WZjW0B6M0EbaKVv"
                    alt="Pearl Shield"
                  />
                </div>
                <img
                  className="w-16 h-16 opacity-50 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1UZaXHff-rJaFV-jsb6OeCVkUC_wXOm3FQVrim8vkrJtsIm9S23BC-Ru1AtAtyDus_bLcFa7aiYvSeH3BC_YDPa2TyBTt9TqZHjdJNzZ2k9Z1sxIaDBx9kRkoMkNXnZz3uCJhe1fJUGG2NGUlnxoI1xMdicpSzwobTi859-8GhNGbZ3sYOSzXUlQ2-hbYJRlLLoAoxhlTVH5ZyfUDkQkMMUJ0MKcfp-JcdvQFCblw5j5quoDjpQRXJ4rSCAC3E3P6xrR_cUfbu62-"
                  alt="Gold"
                />
                <img
                  className="w-14 h-14 opacity-30 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuChJjJv4Qrm6GDBqHSYtdyw9njffYdqw8Me2epaK4igXiM4zf-A43QIW4SRWKgQZcIXJY3OURVXbPe5iKqaAEiU2-1cTZz0RSfEM_awky8Xy_TPvSvjDoj52mmAinxlJRXBgtZ8H5gtLXscmJAA4HtSqE3maePGqmlptWcUAYacfZELjRhjkVckWLL9MLXprgi9W0STw5-oI6V_KqnsGlSUHUUNkcaS4W5KCoCckJcQ1XfqGEnawlqN8yyWxbhD_us8mjxDvYT-IjS9"
                  alt="Champion"
                />
              </div>
              <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface">Giải đấu Ngọc Trai</h1>
              <p className="text-on-surface-variant text-xs md:text-sm mt-1">
                Top 3 lập trình viên dẫn đầu tuần này sẽ giành chiến thắng!
              </p>
              <div className="bg-surface-container-high border-b-4 border-black/30 px-4 py-1.5 rounded-2xl flex items-center gap-1.5 mt-4 text-brand-yellow font-black text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>Còn 4 ngày</span>
              </div>
            </div>

            {/* Standings Table */}
            <div className="space-y-3">
              {allStandings.map((competitor, idx) => {
                const rank = idx + 1;
                const medal = getRankMedal(rank);

                // Promoted (1-3), demoted (8+)
                const isPromoted = rank <= 3;
                const isDemoted = rank >= 8;

                return (
                  <React.Fragment key={competitor.name}>
                    {/* Promotion Divider Banner */}
                    {rank === 4 && (
                      <div className="py-4 flex items-center justify-center gap-4">
                        <div className="h-[2px] flex-1 bg-secondary/25"></div>
                        <span className="font-label-lg text-secondary text-[10px] font-black uppercase tracking-widest">
                          ▲ NHÓM THĂNG HẠNG ▲
                        </span>
                        <div className="h-[2px] flex-1 bg-secondary/25"></div>
                      </div>
                    )}

                    {/* Demotion Divider Banner */}
                    {rank === 8 && (
                      <div className="py-4 flex items-center justify-center gap-4">
                        <div className="h-[2px] flex-1 bg-brand-red/20"></div>
                        <span className="font-label-lg text-brand-red text-[10px] font-black uppercase tracking-widest">
                          ▼ NHÓM RỚT HẠNG ▼
                        </span>
                        <div className="h-[2px] flex-1 bg-brand-red/20"></div>
                      </div>
                    )}

                    {/* Standing Row */}
                    <div
                      className={`flex items-center p-4 rounded-3xl border-b-4 hover:translate-y-[-2px] transition-transform select-none ${
                        competitor.isCurrentUser
                          ? 'bg-secondary-container/10 border-secondary-container/30 border-2'
                          : 'bg-surface-container border-black/20 text-on-surface'
                      }`}
                    >
                      {/* Rank Number / Medal */}
                      <div className="w-10 flex justify-center">
                        {medal ? (
                          <img alt="Medal" className="w-8 h-8 pointer-events-none" src={medal} />
                        ) : (
                          <span className={`font-display-lg text-lg ${
                            competitor.isCurrentUser ? 'text-secondary' : 'text-on-surface-variant/60'
                          }`}>
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-full border-4 mx-4 overflow-hidden bg-surface-variant shrink-0 ${
                        isPromoted
                          ? 'border-secondary-container'
                          : isDemoted
                          ? 'border-brand-red/40'
                          : 'border-outline-variant/30'
                      }`}>
                        <img
                          className="w-full h-full object-cover pointer-events-none"
                          src={competitor.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiIcZrqBjissZ0lmZIA-nyKbvY-D82bJ6mJ8J8rkNI357xJbE9pTlH96D2fG23jtsxJE-e-xpFn4FlMqvERx_Z3xMMIPdJqpy3HR0LV8W7sdE-uv-zKqRVVpJeHEn4EJQQdCjQE1hk4b-Jwgc7rhRgwtY71KRBbjDLnmXt6oDSWm2e-D1-yXq5MXgjUuJ6U1f9lR6QiXv_nTGYIAjippDKnm5DoMpcMX6jPFoiJt9h-XaP4HoI2y18Lm7WqEZ6cwJTNoD4Vu3LjqdO'}
                          alt={competitor.name}
                        />
                      </div>

                      {/* Name & Title */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className={`font-headline-md text-sm md:text-base truncate ${
                          competitor.isCurrentUser ? 'text-secondary font-black' : 'text-on-surface'
                        }`}>
                          {competitor.isCurrentUser ? 'Bạn' : competitor.name}
                        </h3>
                        <p className="font-label-lg text-on-surface-variant text-[11px] truncate mt-0.5">
                          {competitor.title}
                        </p>
                      </div>

                      {/* XP Score */}
                      <div className="text-right shrink-0">
                        <span className={`font-display-lg text-base md:text-lg ${
                          isPromoted
                            ? 'text-secondary'
                            : isDemoted
                            ? 'text-brand-red'
                            : 'text-on-surface-variant'
                        }`}>
                          {competitor.xp} XP
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

          </div>
        </main>

        {/* COLUMN 3: Status & Emojis Panel (Desktop only) */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar">
          
          {/* Top Status Header */}
          <div className="flex items-center justify-between bg-surface-container p-2 rounded-2xl border-b-4 border-black/20">
            <div className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-black text-sm">{user.streak}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                award
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

          {/* Emoji Status Card Widget */}
          <div className="bg-surface-container rounded-3xl p-5 border-b-4 border-black/20 space-y-4 shadow-md text-center">
            <h3 className="font-headline-md text-sm leading-tight text-left">Trạng thái cảm xúc</h3>
            
            {/* Main Avatar Bubble with Emoji Badge */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-surface-variant bg-surface-dim shadow-sm">
                <img
                  src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiIcZrqBjissZ0lmZIA-nyKbvY-D82bJ6mJ8J8rkNI357xJbE9pTlH96D2fG23jtsxJE-e-xpFn4FlMqvERx_Z3xMMIPdJqpy3HR0LV8W7sdE-uv-zKqRVVpJeHEn4EJQQdCjQE1hk4b-Jwgc7rhRgwtY71KRBbjDLnmXt6oDSWm2e-D1-yXq5MXgjUuJ6U1f9lR6QiXv_nTGYIAjippDKnm5DoMpcMX6jPFoiJt9h-XaP4HoI2y18Lm7WqEZ6cwJTNoD4Vu3LjqdO'}
                  alt="Status Avatar"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center border-4 border-surface-container animate-bounce text-sm">
                {userEmoji}
              </div>
            </div>

            {/* Emoji Selection Grid */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`aspect-square flex items-center justify-center rounded-xl border-b-4 border-black/20 hover:scale-105 active:translate-y-[2px] active:border-b-2 transition-all text-xl ${
                    selectedEmoji === emoji ? 'bg-secondary-container' : 'bg-surface-container-high'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Submit changes button */}
            <button
              onClick={() => setUserEmoji(selectedEmoji)}
              className="w-full bg-secondary-container text-on-secondary-container font-button py-2.5 rounded-xl border-b-4 border-on-secondary-fixed-variant hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all uppercase text-xs font-black tracking-wide"
            >
              CẬP NHẬT
            </button>
          </div>

          {/* Premium package promo card */}
          <div className="mt-auto bg-gradient-to-br from-primary-container to-blue-700 rounded-3xl p-5 border-b-4 border-black/30 relative overflow-hidden group shadow-md text-white">
            <div className="relative z-10 space-y-2">
              <h4 className="font-headline-md text-sm font-black">Mở khóa Focus Pro</h4>
              <p className="font-label-lg text-white/80 text-[11px] leading-relaxed">
                Học nhóm không giới hạn mạng học tập, mở khóa bảng xếp hạng Pro!
              </p>
              <button
                onClick={() => router.push('/shop')}
                className="bg-white text-blue-800 font-button px-4 py-2 rounded-xl border-b-4 border-blue-900/20 active:scale-95 transition-transform uppercase text-[10px] font-black"
              >
                NÂNG CẤP NGAY
              </button>
            </div>
            <span
              className="material-symbols-outlined absolute -bottom-4 -right-4 text-[72px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
          </div>

        </aside>

      </div>
    </div>
  );
}
