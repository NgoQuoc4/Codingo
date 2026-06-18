'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGetLeaderboard } from '../../../lib/api';

interface LeaderboardUser {
  name: string;
  avatar: string;
  title: string;
  xp: number;
  isCurrentUser?: boolean;
}

// Define leagues data outside the component to avoid recreating it
const LEAGUES = [
  {
    id: 'bronze',
    name: 'Đồng',
    fullName: 'Giải đấu Hạng Đồng',
    minXp: 0,
    maxXp: 149,
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    shieldUrl: '/ranks/bronze.png',
    description: 'Nơi xuất phát của các tân thủ lập trình.',
    competitors: [
      { username: 'Lập trình viên giấy', xp: 90, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=paper', role: 'user' },
      { username: 'Cú Đêm Code', xp: 75, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=owl', role: 'user' },
      { username: 'Gà Con Tập Sự', xp: 50, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=kitty', role: 'user' },
      { username: 'Sóc Con', xp: 30, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=squirrel', role: 'user' },
    ]
  },
  {
    id: 'silver',
    name: 'Bạc',
    fullName: 'Giải đấu Hạng Bạc',
    minXp: 150,
    maxXp: 399,
    accentColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    shieldUrl: '/ranks/silver.png',
    description: 'Nơi rèn luyện những kỹ năng lập trình cơ bản.',
    competitors: [
      { username: 'Khủng Long JS', xp: 320, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dino', role: 'user' },
      { username: 'Mèo Chăm Chỉ', xp: 280, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=kitty', role: 'user' },
      { username: 'Rùa Kiên Trì', xp: 210, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=turtle', role: 'user' },
      { username: 'Thỏ Nhỏ', xp: 180, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=bunny', role: 'user' },
    ]
  },
  {
    id: 'gold',
    name: 'Vàng',
    fullName: 'Giải đấu Hạng Vàng',
    minXp: 400,
    maxXp: 799,
    accentColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    shieldUrl: '/ranks/gold.png',
    description: 'Bắt đầu làm chủ các giải thuật phức tạp.',
    competitors: [
      { username: 'Thần Sấm Code', xp: 720, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=thor', role: 'user' },
      { username: 'Kiếm Sĩ Solo', xp: 680, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sword', role: 'user' },
      { username: 'Sói Đơn Độc', xp: 550, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=wolf', role: 'user' },
      { username: 'Phượng Hoàng Lửa', xp: 480, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=phoenix', role: 'user' },
    ]
  },
  {
    id: 'pearl',
    name: 'Ngọc Trai',
    fullName: 'Giải đấu Hạng Ngọc Trai',
    minXp: 800,
    maxXp: 1499,
    accentColor: 'text-magenta-400',
    bgColor: 'bg-magenta-500/10',
    borderColor: 'border-magenta-500/30',
    shieldUrl: '/ranks/pearl.png',
    description: 'Hạng đấu cao cấp dành cho chiến binh kiên cường.',
    competitors: [
      { username: 'Linh Phù Thủy', xp: 1240, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=witch', role: 'user' },
      { username: 'Cung Thủ Xanh', xp: 980, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=archer', role: 'user' },
      { username: 'Hổ Trắng', xp: 890, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=tiger', role: 'user' },
      { username: 'Gấu Trúc Master', xp: 850, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=panda', role: 'user' },
    ]
  },
  {
    id: 'diamond',
    name: 'Kim Cương',
    fullName: 'Giải đấu Hạng Kim Cương',
    minXp: 1500,
    maxXp: 99999,
    accentColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    shieldUrl: '/ranks/diamond.png',
    description: 'Đỉnh cao của lập trình viên xuất chúng.',
    competitors: [
      { username: 'Đệ Nhất Code', xp: 2500, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=god', role: 'user' },
      { username: 'Thần Đồng Python', xp: 1980, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cobra', role: 'user' },
      { username: 'Cao Thủ Thuật Toán', xp: 1650, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=binary', role: 'user' },
    ]
  }
];

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [selectedEmoji, setSelectedEmoji] = useState('😎');
  const [userEmoji, setUserEmoji] = useState('😎');

  // Dynamic active league calculations
  const getUserLeagueId = (xp: number) => {
    if (xp < 150) return 'bronze';
    if (xp < 400) return 'silver';
    if (xp < 800) return 'gold';
    if (xp < 1500) return 'pearl';
    return 'diamond';
  };

  const userActiveLeagueId = user ? getUserLeagueId(user.xp) : 'bronze';
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  // Tải giải đấu hiện tại của người dùng khi trang bắt đầu tải lần đầu
  useEffect(() => {
    if (user && !selectedLeagueId) {
      setSelectedLeagueId(getUserLeagueId(user.xp));
    }
  }, [user, selectedLeagueId]);

  const { data: standings = [], isLoading: loadingStandings } = useQuery<any[]>({
    queryKey: ['leaderboard'],
    queryFn: () => apiGetLeaderboard(10),
  });

  if (!user) return null;



  // Identify currently selected league & check if active
  const selectedLeague = LEAGUES.find(l => l.id === selectedLeagueId) || LEAGUES.find(l => l.id === userActiveLeagueId) || LEAGUES[0];
  const isUserInSelectedLeague = selectedLeague.id === userActiveLeagueId;

  let allStandings: LeaderboardUser[] = [];

  if (isUserInSelectedLeague) {
    const isAlreadyInStandings = standings.some(
      (item) => item.id === user.id || item.username === user.username
    );

    let displayedStandings = standings.map((item) => ({
      name: item.username,
      avatar: item.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.username}`,
      title: item.id === user.id || item.username === user.username
        ? 'Bạn đang cố gắng!'
        : item.role === 'admin'
        ? 'Quản trị viên'
        : item.xp >= 1000
        ? 'Huyền thoại tập trung'
        : item.xp >= 800
        ? 'Chuyên gia code'
        : item.xp >= 500
        ? 'Lập trình viên cốt cán'
        : item.xp >= 200
        ? 'Học viên chăm chỉ'
        : 'Lập trình viên tập sự',
      xp: item.xp,
      isCurrentUser: item.id === user.id || item.username === user.username,
    }));

    if (!isAlreadyInStandings) {
      displayedStandings.push({
        name: user.username,
        avatar: user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`,
        title: 'Bạn đang cố gắng!',
        xp: user.xp,
        isCurrentUser: true,
      });
    }

    allStandings = displayedStandings.sort((a, b) => b.xp - a.xp);
  } else {
    // Return mock competitors for this tier
    allStandings = selectedLeague.competitors.map((item) => ({
      name: item.username,
      avatar: item.avatar,
      title: item.role === 'admin' ? 'Quản trị viên' : 'Lập trình viên tích cực',
      xp: item.xp,
      isCurrentUser: false,
    })).sort((a, b) => b.xp - a.xp);
  }

  const emojis = ['😎', '🎉', '💪', '🇻🇳', '🔥', '😴', '📚', '🍀'];

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '/medals/medal_1st.png';
    if (rank === 2) return '/medals/medal_2nd.png';
    if (rank === 3) return '/medals/medal_3rd.png';
    return null;
  };

  return (
    <>
        {/* CENTER COLUMN: Leaderboard Arena */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-10">
            
            {/* Leagues Tabs Selector */}
            <div className="grid grid-cols-5 gap-2 bg-surface-container p-2 rounded-3xl border-b-4 border-black/20">
              {LEAGUES.map((lg) => {
                const isActive = lg.id === userActiveLeagueId;
                const isSelected = lg.id === selectedLeagueId;

                return (
                  <button
                    key={lg.id}
                    onClick={() => setSelectedLeagueId(lg.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border-b-4 hover:scale-[1.03] active:translate-y-[2px] transition-all relative ${
                      isSelected
                        ? `${lg.bgColor} ${lg.borderColor} text-on-surface border-2 font-black shadow-inner`
                        : 'bg-surface-container-high border-black/15 text-on-surface-variant/70'
                    }`}
                  >
                    <img src={lg.shieldUrl} alt={lg.name} className="w-8 h-8 object-contain mb-1 mix-blend-screen" />
                    <span className="text-[10px] md:text-xs font-black tracking-wide leading-none">{lg.name}</span>

                    {/* Active League indicator badge */}
                    {isActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border border-surface-container animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Arena Header with Dynamic League Medal */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-36 h-36 mb-4 select-none flex items-center justify-center">
                {/* Glowing Aura Effect */}
                <div className={`absolute inset-2 ${selectedLeague.bgColor} blur-2xl rounded-full opacity-60 scale-110 animate-pulse`}></div>
                
                {/* Centered Floating Shield */}
                <img
                  className="w-28 h-28 object-contain relative z-10 animate-float mix-blend-screen"
                  src={selectedLeague.shieldUrl}
                  alt={selectedLeague.name}
                />
              </div>
              <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface">{selectedLeague.fullName}</h1>
              <p className="text-on-surface-variant text-xs md:text-sm mt-1 max-w-md">
                {selectedLeague.description}
              </p>
              <div className="bg-surface-container-high border-b-4 border-black/30 px-4 py-1.5 rounded-2xl flex items-center gap-1.5 mt-4 text-brand-yellow font-black text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>Còn 4 ngày</span>
              </div>
            </div>

            {/* League Promotion info card */}
            {!isUserInSelectedLeague && (
              <div className={`p-4 rounded-3xl border-2 border-b-4 flex items-start md:items-center gap-3 bg-surface-container ${selectedLeague.borderColor}`}>
                <span className="material-symbols-outlined text-3xl text-brand-yellow shrink-0">
                  lock_open
                </span>
                <div className="flex-1 text-xs md:text-sm">
                  {user.xp < selectedLeague.minXp ? (
                    <p className="text-on-surface-variant leading-relaxed">
                      Bạn đang thuộc <strong>Hạng {LEAGUES.find(l => l.id === userActiveLeagueId)?.name}</strong>. Cần thêm{' '}
                      <strong className={selectedLeague.accentColor}>{selectedLeague.minXp - user.xp} XP</strong> để thăng hạng và tranh tài ở{' '}
                      <strong>{selectedLeague.fullName}</strong>!
                    </p>
                  ) : (
                    <p className="text-on-surface-variant leading-relaxed">
                      Bạn đã vượt qua hạng đấu này! Hạng đấu tranh tài hiện tại của bạn là <strong>{LEAGUES.find(l => l.id === userActiveLeagueId)?.fullName}</strong>.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Standings Table */}
            <div className="space-y-3">
              {loadingStandings && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-surface-container rounded-3xl border-b-4 border-black/20">
                  <span className="material-symbols-outlined text-4xl text-secondary animate-spin">refresh</span>
                  <p className="font-extrabold text-on-surface-variant/80">Đang tải bảng xếp hạng...</p>
                </div>
              )}

              {!loadingStandings && allStandings.map((competitor, idx) => {
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
                          : rank === 1
                          ? 'bg-gradient-to-r from-amber-500/10 to-surface-container border-amber-500/30 border-2 text-on-surface shadow-[0_4px_12px_rgba(245,158,11,0.05)]'
                          : rank === 2
                          ? 'bg-gradient-to-r from-slate-400/10 to-surface-container border-slate-400/20 border-2 text-on-surface shadow-[0_4px_12px_rgba(148,163,184,0.05)]'
                          : rank === 3
                          ? 'bg-gradient-to-r from-orange-500/10 to-surface-container border-orange-500/20 border-2 text-on-surface shadow-[0_4px_12px_rgba(249,115,22,0.05)]'
                          : 'bg-surface-container border-black/20 text-on-surface'
                      }`}
                    >
                      {/* Rank Number / Medal */}
                      <div className="w-10 flex justify-center">
                        {medal ? (
                          <img alt="Medal" className="w-8 h-8 pointer-events-none mix-blend-screen" src={medal} />
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
    </>
  );
}
