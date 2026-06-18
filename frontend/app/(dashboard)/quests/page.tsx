'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

/**
 * QuestsPage quản lý và hiển thị bảng điều khiển các nhiệm vụ hàng ngày (Daily Quests)
 * và nhiệm vụ sự kiện hàng tháng của người học (ví dụ: mục tiêu tích lũy XP).
 */
export default function QuestsPage() {
  // Lấy thông tin user hiện tại và token từ Context xác thực
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Trả về null nếu thông tin người dùng chưa được tải
  if (!user) return null;

  // Tính lượng điểm kinh nghiệm đạt được trong ngày (ở bản demo này sử dụng XP chia lấy dư 20 làm ví dụ)
  const dailyXp = user.xp % 20;
  // Tính tỷ lệ phần trăm hoàn thành nhiệm vụ hàng ngày (mục tiêu 20 XP một ngày)
  const dailyProgressPercent = Math.min((dailyXp / 20) * 100, 100);

  return (
    <>
        {/* CENTER COLUMN: Khung chính hiển thị danh sách nhiệm vụ */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">

          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* Monthly Challenge Hero Card */}
            <section>
              <div className="relative bg-[#A361FF] rounded-3xl p-6 border-b-8 border-black/20 overflow-hidden min-h-[220px] flex flex-col justify-between shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-white font-black text-[10px] tracking-widest mb-2 uppercase">
                      THÁNG SÁU
                    </span>
                    <h2 className="font-headline-lg text-xl md:text-2xl font-black">Nhiệm vụ tháng Sáu</h2>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-xs mt-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>28 NGÀY CÒN LẠI</span>
                    </div>
                  </div>
                  <div className="w-24 h-24 absolute -right-2 -top-2 opacity-35 animate-float">
                    <img
                      className="w-full h-full object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlj75Ydsuzcij0WCF-PQG2i7EU-LgsUw2dXD-1JIezqtl7CvksZukHStcNzV2_eceLtKqSqlk6opGwfQcw9V5rxJ0teTf82lkEfk9ZFgcprMaCMFwrlWVjZBDLpJvdP5zKNRKz01g8lfU_5Yu9ohREpevJz9kOUDmmW4DjUt9AObuieDB2mVg3TDeii3tWZ6Rw6bGeugTP3dRQkM5XSRpQ7OlVggIQFw3IjUIGrvAeJCVB3QSQBVZmwOpbkBUFWzIEA-gv359rd-FM"
                      alt="Trophy"
                    />
                  </div>
                </div>

                <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1 text-xs font-black">
                      <span>Hoàn thành 30 nhiệm vụ</span>
                      <span>2 / 30</span>
                    </div>
                    <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden border border-white/20 p-0.5">
                      <div className="h-full bg-secondary-container w-[6.6%] rounded-full shadow-[0_0_10px_rgba(88,204,2,0.5)]"></div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-xl border-b-4 border-yellow-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-yellow-900 font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                      emoji_events
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Daily Quests List */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-headline-md text-base md:text-lg text-on-surface uppercase tracking-wide">
                  Nhiệm vụ hằng ngày
                </h3>
                <div className="flex items-center gap-1 text-on-surface-variant font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  <span>MỚI SAU 6 TIẾNG</span>
                </div>
              </div>

              <div className="bg-surface-container border-2 border-slate-800 rounded-3xl p-4 flex flex-col gap-4 shadow-lg">
                {/* Daily Quest 1 */}
                <div className="flex items-center gap-4 p-3 hover:bg-surface-bright rounded-2xl transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-b-4 border-primary/40">
                    <span className="material-symbols-outlined text-primary font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                      bolt
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm md:text-base text-on-surface mb-1">Kiếm 20 KN</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-surface-container-lowest rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-500"
                          style={{ width: `${dailyProgressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-secondary font-black text-xs min-w-[40px] text-right">
                        {dailyXp} / 20
                      </span>
                    </div>
                  </div>
                  {dailyXp >= 20 && (
                    <div className="shrink-0 flex items-center gap-2">
                      <div className="w-10 h-10 relative flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-amber-600">inventory_2</span>
                        <div className="absolute -top-1 -right-1 bg-secondary w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface-container">
                          <span className="material-symbols-outlined text-[8px] text-on-secondary font-black">check</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-800 mx-2"></div>

                {/* Daily Quest 2 */}
                <div className="flex items-center gap-4 p-3 hover:bg-surface-bright rounded-2xl transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center shrink-0 border-b-4 border-slate-900/50">
                    <span className="material-symbols-outlined text-slate-400">track_changes</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm md:text-base text-on-surface mb-1">Luyện tập hoàn hảo</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-surface-container-lowest rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
                        <div className="h-full bg-slate-600 w-0 rounded-full"></div>
                      </div>
                      <span className="text-on-surface-variant font-black text-xs min-w-[40px] text-right">0 / 1</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center grayscale opacity-40">
                      <span className="material-symbols-outlined text-3xl text-slate-400">lock</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800 mx-2"></div>

                {/* Daily Quest 3 */}
                <div className="flex items-center gap-4 p-3 hover:bg-surface-bright rounded-2xl transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-b-4 border-primary/40">
                    <span className="material-symbols-outlined text-primary font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                      bolt
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm md:text-base text-on-surface mb-1">Đạt 15 KN combo</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-surface-container-lowest rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
                        <div className="h-full bg-secondary w-[20%] rounded-full"></div>
                      </div>
                      <span className="text-secondary font-black text-xs min-w-[40px] text-right">3 / 15</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center grayscale opacity-40">
                      <span className="material-symbols-outlined text-3xl text-yellow-500">lock</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>

        {/* COLUMN 3: Stats & Badges archive */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar">
          
          {/* Top Status Bar */}
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

          {/* Monthly Challenges Badge Archive */}
          <div className="space-y-4">
            <h3 className="font-headline-md text-base leading-tight">Huy hiệu thử thách</h3>
            <div className="bg-surface-container border-2 border-slate-800 rounded-3xl p-3 flex flex-col gap-3 shadow-md">
              {/* Current Month Locked */}
              <div className="flex items-center gap-3 p-2">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-slate-700">lock</span>
                </div>
                <p className="text-on-surface-variant text-[11px] font-bold leading-snug italic">
                  Đạt 30 nhiệm vụ để nhận huy hiệu tháng Sáu.
                </p>
              </div>

              <div className="h-px bg-slate-800 mx-2"></div>

              {/* May Badge */}
              <div className="flex items-center gap-3 p-2 hover:bg-surface-bright rounded-xl transition-all cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-b-4 border-green-800 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    className="w-10 h-10 object-contain pointer-events-none"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuClupMLbe4eDeCWDYnhD70W5kqtJDNx_GqE4CfIk3tNci_nb3GzUSh6N-Z0iFbM6Wknj-5Oget0mWCm1tF1M4JE-gvBgVk0FEEDssFGKeHyTHkIEIB2ZbRHiop5yGitjyfPMLqj1Zce_vri5pfb4wdXO637fHB3hPfxm4xUPTGOgXP6fyFiQ2mhToGTeQb7SLqW_7b9V1PJfVcya1ZZQFHD8x9uZkGKvGqel40jln7qDPrquEaYjqnNBhEbaQSZEYIPbyTaAB-MOXM6"
                    alt="May Medal"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Thách thức tháng Năm</h4>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">THÁNG 5 NĂM 2026</p>
                </div>
              </div>

              <div className="h-px bg-slate-800 mx-2"></div>

              {/* April Badge */}
              <div className="flex items-center gap-3 p-2 hover:bg-surface-bright rounded-xl transition-all cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-b-4 border-blue-800 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    className="w-10 h-10 object-contain pointer-events-none"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqar_59_mZvI4456cjnXFYkmjmyylkh-7VmW-Lq9oVQqxa2Qa-Ol6ZsM9E1Fk4RW0mYEJJkah6MlplF-zEpiFz523yftYSUwaVm2QpVCJvHNBOB9kvp018Yfmo1W8fXkhoAjNR8b0ntr94ie2jwkDFBybYxmCcZKSOGK3TzWemrvYoUFI6SOtQrDQXf0-7n1nVJ4FdAqWLYqt8qfqPbbW0nSpSTpsyPiAGSOUD0pQli9bUx0g0eLKQOpFhhr1scaTqmZq1kpTqDUMm"
                    alt="April Medal"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Thách thức tháng Tư</h4>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">THÁNG 4 NĂM 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Space widget */}
          <div className="mt-auto bg-primary-container rounded-3xl p-5 border-b-4 border-black/20 flex flex-col items-center text-center gap-3 shadow-md text-white">
            <span className="material-symbols-outlined text-4xl text-white">rocket_launch</span>
            <h4 className="font-headline-md text-base">Nâng cấp Focus Pro</h4>
            <p className="font-body-md text-sky-100 text-xs">Vô hạn mạng học tập, tắt sạch quảng cáo!</p>
            <button
              onClick={() => router.push('/shop')}
              className="w-full py-2 bg-white text-primary-container font-black text-xs rounded-xl border-b-4 border-gray-300 flat-3d-button active-3d-button uppercase"
            >
              MỞ KHÓA NGAY
            </button>
          </div>
        </aside>
    </>
  );
}
