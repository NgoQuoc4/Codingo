'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Navbar';
import Link from 'next/link';

interface TheoryLesson {
  id: string;
  title: string;
  category: 'variables' | 'functions' | 'logic';
  tag: string;
  shortDesc: string;
  longDesc: string;
  code: string;
  useCase: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PhoneticsPage() {
  const { token, user, loading: authLoading, addXp } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'variables' | 'functions' | 'logic'>('all');
  const [selectedLesson, setSelectedLesson] = useState<TheoryLesson | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [awardingXp, setAwardingXp] = useState(false);
  const [xpMessage, setXpMessage] = useState<string | null>(null);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic lessons from database
  const [lessons, setLessons] = useState<TheoryLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // Auto-redirect if not logged in
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login');
    }
  }, [token, authLoading]);

  // Fetch theory lessons from backend Course API
  useEffect(() => {
    if (authLoading || !token) return;

    const fetchTheoryLessons = async () => {
      try {
        setLessonsLoading(true);
        const res = await fetch(`${API_URL}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
        } else {
          console.error('Failed to load theory lessons');
        }
      } catch (err) {
        console.error('Connection error loading theory lessons:', err);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchTheoryLessons();
  }, [token, authLoading]);

  // Load mastered state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('codingo_mastered_theory');
    if (saved) {
      try {
        setMasteredIds(JSON.parse(saved));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);



  if (authLoading || !user || lessonsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">
          {lessonsLoading ? 'Đang tải bài học từ database...' : 'Đang tải sổ tay lý thuyết...'}
        </p>
      </div>
    );
  }

  // Toggle mastered status
  const handleToggleMastered = (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    let next: string[];
    if (masteredIds.includes(id)) {
      next = masteredIds.filter(x => x !== id);
    } else {
      next = [...masteredIds, id];
    }
    setMasteredIds(next);
    localStorage.setItem('codingo_mastered_theory', JSON.stringify(next));
  };



  // Copy Code to Clipboard
  const handleCopyCode = (code: string, id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Award XP for completing practice review
  const handleStartPractice = () => {
    if (awardingXp || lessons.length === 0) return;
    
    // Pick an unmastered lesson or random lesson
    const unmastered = lessons.filter(l => !masteredIds.includes(l.id));
    const pool = unmastered.length > 0 ? unmastered : lessons;
    const randomLesson = pool[Math.floor(Math.random() * pool.length)];
    
    setSelectedLesson(randomLesson);
    setIsPracticeMode(true);
  };

  const handleCompletePractice = async () => {
    if (awardingXp || !selectedLesson) return;
    setAwardingXp(true);

    try {
      const res = await addXp(10);
      if (res.success) {
        setXpMessage('+10 KN! Tuyệt vời!');
        // Automatically mark as mastered
        if (!masteredIds.includes(selectedLesson.id)) {
          const next = [...masteredIds, selectedLesson.id];
          setMasteredIds(next);
          localStorage.setItem('codingo_mastered_theory', JSON.stringify(next));
        }
      } else {
        setXpMessage('Lỗi kết nối. Thử lại sau.');
      }
    } catch (err) {
      setXpMessage('Lỗi hệ thống.');
    } finally {
      setAwardingXp(false);
      setSelectedLesson(null);
      setIsPracticeMode(false);
      setTimeout(() => setXpMessage(null), 3000);
    }
  };

  // Helper syntax highlighter
  const highlightCode = (code: string) => {
    const tokenRegex = /(\/\/.*)|("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(`[^`\\]*(?:\\.[^`\\]*)*`)|(\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|true|false|null|undefined|class|new|try|catch)\b)|(\b(?:map|filter|reduce|forEach|log)\b)|(\b\d+\b)|(===|!==|==|!=|=>|=|\+|-|\*|\/|\?|:)|([a-zA-Z_$][a-zA-Z0-9_$]*)|(\s+)|(.)/g;
    
    const tokens: React.ReactNode[] = [];
    let match;
    let index = 0;
    
    while ((match = tokenRegex.exec(code)) !== null) {
      const [
        text,
        comment,
        doubleQuoteStr,
        singleQuoteStr,
        backtickStr,
        keyword,
        method,
        number,
        operator,
        word,
        whitespace,
        other
      ] = match;
      
      const key = `token-${index++}`;
      
      if (comment) {
        tokens.push(<span key={key} className="text-emerald-500 italic">{text}</span>);
      } else if (doubleQuoteStr || singleQuoteStr || backtickStr) {
        tokens.push(<span key={key} className="text-yellow-300">{text}</span>);
      } else if (keyword) {
        tokens.push(<span key={key} className="text-pink-400 font-bold">{text}</span>);
      } else if (method) {
        tokens.push(<span key={key} className="text-sky-400 font-medium">{text}</span>);
      } else if (number) {
        tokens.push(<span key={key} className="text-amber-400">{text}</span>);
      } else if (operator) {
        tokens.push(<span key={key} className="text-cyan-400 font-bold">{text}</span>);
      } else if (word) {
        tokens.push(<span key={key} className="text-slate-200">{text}</span>);
      } else if (whitespace) {
        tokens.push(text);
      } else {
        tokens.push(<span key={key} className="text-slate-400">{text}</span>);
      }
    }
    
    return <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">{tokens}</pre>;
  };

  // Filter lessons based on active category tab
  const filteredLessons = lessons.filter(
    (l) => activeTab === 'all' || l.category === activeTab
  );

  // Left sidebar status calculation
  const totalLessonsNeeded = 10;
  const lessonsDone = masteredIds.length;
  const progressPercent = Math.min((lessonsDone / totalLessonsNeeded) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* CENTER COLUMN: Theory Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 relative">
          
          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-black text-on-surface mb-2">
              Sổ Tay Lý Thuyết
            </h1>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant font-medium">
              Tóm tắt những kiến thức cốt lõi và các cú pháp hay sử dụng nhất.
            </p>
            
            <div className="mt-8 flex flex-col items-center justify-center gap-3">
              <button
                onClick={handleStartPractice}
                disabled={awardingXp || lessons.length === 0}
                className="bg-primary-container text-on-primary-container font-button px-8 py-3 rounded-3xl border-b-8 border-on-primary-fixed-variant flex items-center gap-2 shadow-xl hover:brightness-110 active:translate-y-0.5 active:border-b-4 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
                <span className="font-black uppercase tracking-wider">
                  {awardingXp ? 'ĐANG XỬ LÝ...' : 'ÔN TẬP NHANH +10 KN'}
                </span>
              </button>
              
              {/* Floating XP Reward Message */}
              <div className={`transition-all duration-500 font-black text-sm h-6 ${xpMessage ? 'opacity-100 translate-y-0 text-secondary' : 'opacity-0 translate-y-4'}`}>
                {xpMessage}
              </div>
            </div>
          </header>

          {/* Categories Tab Navigation */}
          <div className="max-w-4xl mx-auto mb-8 flex flex-wrap gap-2.5 justify-center border-b-4 border-surface-container pb-4">
            {[
              { id: 'all', name: 'Tất cả', icon: 'list' },
              { id: 'variables', name: 'Biến & Kiểu dữ liệu', icon: 'data_object' },
              { id: 'functions', name: 'Hàm & Phương thức', icon: 'function' },
              { id: 'logic', name: 'Logic & Cú pháp', icon: 'alt_route' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-b-4 font-bold text-xs uppercase transition-all active:translate-y-[2px] active:border-b-2 ${
                  activeTab === cat.id
                    ? 'bg-secondary text-on-secondary border-secondary-dark'
                    : 'bg-surface-container text-on-surface-variant border-black/20 hover:bg-surface-bright'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <section className="mb-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLessons.map((lesson) => {
                const isMastered = masteredIds.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setIsPracticeMode(false);
                    }}
                    className={`bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 hover:-translate-y-1 hover:ring-4 hover:ring-secondary/30 cursor-pointer flex flex-col justify-between transition-all active:translate-y-0.5 active:border-b-4 relative overflow-hidden group`}
                  >
                    {/* Status indicator on top corner */}
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border ${
                          lesson.category === 'variables' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          lesson.category === 'functions' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {lesson.category === 'variables' ? 'Biến & Kiểu dữ liệu' :
                           lesson.category === 'functions' ? 'Hàm & Phương thức' :
                           'Logic & Cú pháp'}
                        </span>
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg bg-surface-variant text-on-surface-variant border border-outline-variant/30">
                          {lesson.tag}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleMastered(lesson.id, e)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-b-2 border-black/20 transition-all ${
                            isMastered 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-600/40 hover:bg-emerald-500/30' 
                              : 'bg-surface-dim text-on-surface-variant/40 hover:text-emerald-400 hover:bg-surface-bright'
                          }`}
                          title={isMastered ? "Bỏ thuộc" : "Đánh dấu đã thuộc"}
                        >
                          <span className="material-symbols-outlined text-sm font-black" style={{ fontVariationSettings: isMastered ? "'FILL' 1" : "'FILL' 0" }}>
                            check_circle
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-headline-md text-base md:text-lg font-black text-on-surface mb-2 group-hover:text-secondary transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="font-body-md text-xs md:text-sm text-on-surface-variant/80 leading-relaxed font-medium mb-6">
                        {lesson.shortDesc}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div>
                      <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden mb-2">
                        <div className={`h-full transition-all duration-500 ${isMastered ? 'w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-0 bg-secondary'}`}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={isMastered ? 'text-emerald-400 font-extrabold' : 'text-on-surface-variant/60'}>
                          {isMastered ? 'ĐÃ THUỘC' : 'CHƯA HỌC'}
                        </span>
                        <span className={isMastered ? 'text-emerald-400' : 'text-on-surface-variant/60'}>
                          {isMastered ? '100%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Floating Atmosphere Elements - Decorative */}
          <div className="absolute inset-0 pointer-events-none z-[-1] opacity-30 overflow-hidden">
            <div className="absolute top-10 -left-20 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-10 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
          </div>

        </main>

        {/* COLUMN 3: Right Status & Widgets panel */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar z-10">
          
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

          {/* Code Reference Badge picker */}
          <div className="bg-surface-container p-4 rounded-3xl border-b-4 border-black/20 flex items-center justify-between cursor-pointer hover:bg-surface-bright transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/30">
                <span className="material-symbols-outlined text-sm">javascript</span>
              </div>
              <span className="font-button text-sm font-black text-on-surface">Modern JS / TS</span>
            </div>
            <span className="material-symbols-outlined text-outline">expand_more</span>
          </div>

          {/* Leaderboard Unlock Card */}
          <div className="bg-surface-container-high p-5 rounded-3xl border-b-4 border-black/40 relative overflow-hidden group cursor-pointer hover:brightness-110 transition-all" onClick={() => router.push('/leaderboard')}>
            <div className="absolute -right-4 -top-4 opacity-20 group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-[80px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
            </div>
            <h3 className="font-headline-md text-base font-black text-on-surface mb-2 relative z-10">Tiến trình học tập</h3>
            <p className="font-body-md text-on-surface-variant text-xs mb-4 relative z-10 font-medium leading-relaxed">
              Bạn đã thuộc {lessonsDone}/{totalLessonsNeeded} bài học lý thuyết cốt lõi trong sổ tay.
            </p>
            <div className="h-2.5 w-full bg-surface-dim rounded-full overflow-hidden mb-2 relative z-10 p-0.5 border border-outline-variant/20">
              <div 
                className="h-full bg-tertiary rounded-full shadow-[0_0_8px_rgba(255,183,127,0.5)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-right font-label-lg text-tertiary text-xs font-black relative z-10">
              {lessonsDone}/{totalLessonsNeeded} hoàn thành
            </div>
          </div>

          {/* Daily Quests Widget */}
          <div className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-button text-sm font-black text-on-surface uppercase">Nhiệm vụ hằng ngày</h3>
              <Link href="/quests" className="text-primary text-[10px] font-black hover:underline tracking-wider">
                XEM TẤT CẢ
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-on-surface mb-1">Kiếm 50 KN</div>
                  <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-secondary rounded-full"></div>
                  </div>
                </div>
                <span className="font-black text-outline text-[10px] w-8 text-right">25/50</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary text-2xl">history</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-on-surface mb-1">Học lý thuyết</div>
                  <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full w-full bg-tertiary rounded-full shadow-[0_0_5px_rgba(255,183,127,0.5)]"></div>
                  </div>
                </div>
                <div className="w-8 flex justify-end">
                  <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* DETAIL MODAL */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-2xl w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] overflow-y-auto max-h-[90vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedLesson(null);
                setIsPracticeMode(false);
              }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright text-on-surface-variant border-2 border-black/10 active:translate-y-[2px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5 mt-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${
                selectedLesson.category === 'variables' ? 'bg-blue-500/10 text-blue-400' :
                selectedLesson.category === 'functions' ? 'bg-pink-500/10 text-pink-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                {selectedLesson.tag}
              </span>
              {isPracticeMode && (
                <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase animate-pulse">
                  Chế độ ôn tập
                </span>
              )}
            </div>

            <h2 className="font-headline-lg text-xl md:text-2xl font-black text-on-surface mb-3 pr-8">
              {selectedLesson.title}
            </h2>

            {/* Body Explanation */}
            <div className="font-body-md text-sm text-on-surface-variant/90 leading-relaxed font-medium mb-6 space-y-4">
              <p>{selectedLesson.longDesc}</p>
              
              <div className="bg-surface p-3 rounded-2xl border border-outline-variant/30 flex items-start gap-2.5 text-xs text-secondary-container-on">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5">lightbulb</span>
                <div>
                  <span className="font-bold">Trường hợp sử dụng: </span>
                  <span className="font-medium text-on-surface-variant">{selectedLesson.useCase}</span>
                </div>
              </div>
            </div>

            {/* IDE-styled Code Snippet Container */}
            <div className="bg-surface-dim rounded-2xl border-2 border-outline-variant p-4 font-mono relative group mb-6 shadow-inner select-text">
              {/* Copy / Speak Controls inside IDE header */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5 pointer-events-auto opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleCopyCode(selectedLesson.code, selectedLesson.id, e)}
                  className="px-3 h-8 text-[11px] font-black rounded-lg bg-surface-container flex items-center gap-1 text-on-surface-variant hover:text-primary border border-black/10 active:translate-y-[1px]"
                  title="Sao chép mã nguồn"
                >
                  <span className="material-symbols-outlined text-xs">
                    {copiedId === selectedLesson.id ? 'done' : 'content_copy'}
                  </span>
                  <span>{copiedId === selectedLesson.id ? 'ĐÃ CHÉP' : 'SAO CHÉP'}</span>
                </button>
              </div>

              {/* Syntax highlighted container */}
              <div className="pt-8 overflow-x-auto">
                {highlightCode(selectedLesson.code)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 border-t border-outline-variant/20 pt-4">
              {isPracticeMode ? (
                <button
                  onClick={handleCompletePractice}
                  disabled={awardingXp}
                  className="bg-secondary text-on-secondary font-button px-6 py-3 rounded-2xl border-b-4 border-secondary-dark flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-0.5 active:border-b-2 transition-all w-full sm:w-auto"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                  </span>
                  <span className="font-black uppercase tracking-wider text-xs">
                    {awardingXp ? 'ĐANG LƯU...' : 'HOÀN THÀNH ÔN TẬP (+10 KN)'}
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedLesson(null);
                      setIsPracticeMode(false);
                    }}
                    className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant font-button px-5 py-3 rounded-2xl border-b-4 border-black/10 active:translate-y-0.5 active:border-b-2 transition-all font-black text-xs uppercase"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      handleToggleMastered(selectedLesson.id);
                    }}
                    className={`font-button px-6 py-3 rounded-2xl border-b-4 flex items-center justify-center gap-2 active:translate-y-0.5 active:border-b-2 transition-all text-xs font-black uppercase ${
                      masteredIds.includes(selectedLesson.id)
                        ? 'bg-surface-variant text-on-surface border-black/20 hover:brightness-105'
                        : 'bg-secondary text-on-secondary border-secondary-dark hover:brightness-110'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {masteredIds.includes(selectedLesson.id) ? 'cancel' : 'check_circle'}
                    </span>
                    <span>
                      {masteredIds.includes(selectedLesson.id) ? 'Bỏ đánh dấu thuộc' : 'Tôi đã thuộc bài này'}
                    </span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
