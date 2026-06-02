'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Navbar';

export default function SettingsPage() {
  const { token, user, loading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();

  // Local state for account details
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);

  // Synchronize state with user context on load
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login');
    } else if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [token, authLoading, user]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">Loading settings...</p>
      </div>
    );
  }

  // Handle preference toggle updates
  const handleToggle = async (key: 'soundEffects' | 'animations' | 'motivationalMessages' | 'listeningExercises', value: boolean) => {
    try {
      await updateUser({ [key]: value });
    } catch (err) {
      console.error(`Failed to update setting ${key}`, err);
    }
  };

  // Handle theme selection
  const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    try {
      await updateUser({ darkMode: value });
      
      // Instantly apply dark mode classes if modified
      const html = document.documentElement;
      if (value === 'on') {
        html.classList.add('dark');
      } else if (value === 'off') {
        html.classList.remove('dark');
      } else {
        // System preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    } catch (err) {
      console.error('Failed to update dark mode preference', err);
    }
  };

  // Handle Account info saving
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setSaveMessage({ text: 'Vui lòng điền đầy đủ thông tin.', isError: true });
      return;
    }

    setSavingAccount(true);
    setSaveMessage(null);

    try {
      const res = await updateUser({ username, email });
      if (res.success) {
        setSaveMessage({ text: 'Đã lưu thông tin tài khoản thành công!', isError: false });
      } else {
        setSaveMessage({ text: res.message || 'Không thể cập nhật thông tin.', isError: true });
      }
    } catch (err) {
      setSaveMessage({ text: 'Có lỗi xảy ra khi kết nối máy chủ.', isError: true });
    } finally {
      setSavingAccount(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* CENTER COLUMN: Settings Editor */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h1 className="font-display-lg text-2xl md:text-3xl font-black text-on-surface mb-2 uppercase tracking-wide">
                Cài đặt riêng
              </h1>
              <p className="text-xs text-on-surface-variant/70 font-bold">
                Quản lý tài khoản, tuỳ chỉnh âm thanh và hiệu ứng bài học của bạn.
              </p>
            </div>

            {/* Account Settings Form Card */}
            <section className="bg-surface-container rounded-3xl border-2 border-slate-800 p-6 shadow-lg">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">account_circle</span>
                <h2 className="font-headline-md text-base md:text-lg">Thông tin tài khoản</h2>
              </div>

              {saveMessage && (
                <div className={`p-4 mb-4 rounded-2xl border text-xs font-bold transition-all ${
                  saveMessage.isError 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {saveMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-2 tracking-wider">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0F172A] border-2 border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-on-surface"
                    placeholder="Nhập tên người dùng"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-2 tracking-wider">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0F172A] border-2 border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-on-surface"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingAccount}
                    className="px-6 py-3 bg-primary text-on-primary-container font-button text-xs rounded-2xl border-b-4 border-sky-800 hover:bg-sky-400 active:translate-y-0.5 active:border-b-0 uppercase font-black transition-all flex items-center gap-2"
                  >
                    {savingAccount ? (
                      <>
                        <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                        <span>ĐANG LƯU...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xs">save</span>
                        <span>LƯU THAY ĐỔI</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Study Experience Card */}
            <section className="bg-surface-container rounded-3xl border-2 border-slate-800 overflow-hidden shadow-lg">
              <div className="p-5 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-base md:text-lg">Cài đặt trải nghiệm học</h2>
              </div>
              
              <div className="flex flex-col">
                {/* Sound Effects */}
                <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
                  <div>
                    <span className="font-bold text-sm block text-on-surface">Hiệu ứng âm thanh</span>
                    <span className="text-[10px] text-on-surface-variant/60">Phát âm thanh khi làm đúng hoặc sai</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={user.soundEffects !== false}
                      onChange={(e) => handleToggle('soundEffects', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Animations */}
                <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
                  <div>
                    <span className="font-bold text-sm block text-on-surface">Hiệu ứng hoạt hình</span>
                    <span className="text-[10px] text-on-surface-variant/60">Bật hiệu ứng chuyển động trong giao diện</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={user.animations !== false}
                      onChange={(e) => handleToggle('animations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Motivational messages */}
                <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
                  <div>
                    <span className="font-bold text-sm block text-on-surface">Thông báo khích lệ</span>
                    <span className="text-[10px] text-on-surface-variant/60">Hiển thị linh vật động viên trong giờ học</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={user.motivationalMessages !== false}
                      onChange={(e) => handleToggle('motivationalMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Listening practice */}
                <div className="flex items-center justify-between p-5">
                  <div>
                    <span className="font-bold text-sm block text-on-surface">Bài tập nghe</span>
                    <span className="text-[10px] text-on-surface-variant/60">Kích hoạt các câu hỏi phát âm từ vựng</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={user.listeningExercises !== false}
                      onChange={(e) => handleToggle('listeningExercises', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Interface theme select */}
            <section className="bg-surface-container rounded-3xl border-2 border-slate-800 p-6 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="font-bold text-sm text-on-surface">Giao diện (Chế độ tối)</h2>
                  <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Lựa chọn cấu hình hiển thị sáng tối phù hợp</p>
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={user.darkMode || 'system'}
                    onChange={handleThemeChange}
                    className="w-full appearance-none bg-[#0F172A] border-2 border-slate-800 rounded-2xl px-4 py-2 font-button text-on-surface uppercase tracking-wider text-xs pr-10 cursor-pointer hover:bg-surface-bright transition-colors focus:outline-none focus:border-primary"
                  >
                    <option value="system">MẶC ĐỊNH HỆ THỐNG</option>
                    <option value="on">BẬT CHẾ ĐỘ TỐI</option>
                    <option value="off">TẮT CHẾ ĐỘ TỐI</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70">
                    expand_more
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* COLUMN 3: Right Control Panel */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar">
          
          {/* Index Link Actions Card */}
          <div className="bg-surface-container rounded-3xl border-2 border-slate-800 p-4 flex flex-col gap-2">
            <button className="w-full text-left p-3 font-button text-xs font-black text-on-surface bg-surface-variant rounded-xl border-l-4 border-primary uppercase">
              Cài đặt riêng
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-full text-left p-3 font-button text-xs font-black text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-bright rounded-xl transition-all uppercase"
            >
              Hồ sơ cá nhân
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="w-full text-left p-3 font-button text-xs font-black text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-bright rounded-xl transition-all uppercase"
            >
              Quay lại học
            </button>
          </div>

          {/* Premium Subscription Card */}
          <div className="bg-surface-container rounded-3xl border-2 border-slate-800 p-5 flex flex-col gap-3 group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-sm text-on-surface">Gói đăng ký</h3>
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                diamond
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant/70 leading-relaxed font-medium">
              Bạn đang sử dụng gói tài khoản Học tập Miễn phí. Hãy nâng cấp lên Focus Pro để truy cập vô hạn mạng!
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="w-full py-2 bg-gradient-to-t from-orange-600 to-amber-500 text-white font-button text-[10px] rounded-xl border-b-4 border-orange-800 hover:brightness-110 active:translate-y-0.5 active:border-b-0 uppercase transition-all"
            >
              CHỌN GÓI ĐĂNG KÝ
            </button>
          </div>

          {/* Help Center Card */}
          <div className="bg-surface-container rounded-3xl border-2 border-slate-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-sm text-on-surface">Hỗ trợ</h3>
              <span className="material-symbols-outlined text-secondary text-xl">help</span>
            </div>
            <a
              href="#"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all"
            >
              <span className="font-bold text-xs">Trung tâm trợ giúp</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </a>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="mt-auto w-full py-3 rounded-2xl border-2 border-slate-800 bg-transparent text-primary hover:text-brand-red hover:bg-brand-red/10 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>ĐĂNG XUẤT TÀI KHOẢN</span>
          </button>
        </aside>

      </div>
    </div>
  );
}
