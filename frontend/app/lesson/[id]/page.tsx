'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface Exercise {
  _id?: string;
  type: 'multiple_choice' | 'drag_drop' | 'code_input';
  question: string;
  options: string[];
  correctAnswer: any;
}

interface Lesson {
  _id: string;
  title: string;
  exercises: Exercise[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Audio tone generator
const playTone = (type: 'correct' | 'incorrect') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05 + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3 + idx * 0.08);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + 0.4 + idx * 0.08);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (err) {
    console.error('Audio synthesis failed', err);
  }
};

export default function LessonPage() {
  const { id: lessonId } = useParams() as { id: string };
  const { token, user, loseHeart, refillHearts, refreshUser } = useAuth();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Exercise Answer states
  const [mcSelected, setMcSelected] = useState<string>('');
  const [ciText, setCiText] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Correct/incorrect validation states
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Finishing screen states
  const [lessonFinished, setLessonFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [completing, setCompleting] = useState(false);

  // Hearts refill overlay states
  const [showOutOfHeartsModal, setShowOutOfHeartsModal] = useState(false);
  const [refillLoading, setRefillLoading] = useState(false);
  const [refillMsg, setRefillMsg] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLessonData();
  }, [lessonId, token]);

  useEffect(() => {
    if (user && user.hearts === 0 && !isChecked) {
      setShowOutOfHeartsModal(true);
    }
  }, [user?.hearts]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load lesson exercises');
      }

      const data = await res.json();
      setLesson(data);
      setExercises(data.exercises || []);
      setCurrentIdx(0);
      setupExercise(data.exercises[0]);
    } catch (err) {
      setError('Could not load lesson details.');
    } finally {
      setLoading(false);
    }
  };

  const setupExercise = (ex: Exercise) => {
    setMcSelected('');
    setCiText('');
    setIsChecked(false);
    setIsCorrect(false);

    if (ex && ex.type === 'drag_drop') {
      setSelectedTokens([]);
      const shuffled = [...ex.options].sort(() => Math.random() - 0.5);
      setAvailableTokens(shuffled);
    }
  };

  const handleTokenSelect = (token: string, tokenIdx: number) => {
    if (isChecked) return;
    setSelectedTokens([...selectedTokens, token]);
    const updated = [...availableTokens];
    updated.splice(tokenIdx, 1);
    setAvailableTokens(updated);
  };

  const handleTokenRemove = (token: string, tokenIdx: number) => {
    if (isChecked) return;
    const updatedSelected = [...selectedTokens];
    updatedSelected.splice(tokenIdx, 1);
    setSelectedTokens(updatedSelected);
    setAvailableTokens([...availableTokens, token]);
  };

  const currentExercise = exercises[currentIdx];

  const hasAnswered = () => {
    if (!currentExercise) return false;
    if (currentExercise.type === 'multiple_choice') return mcSelected !== '';
    if (currentExercise.type === 'code_input') return ciText.trim() !== '';
    if (currentExercise.type === 'drag_drop') return selectedTokens.length > 0;
    return false;
  };

  const handleCheckAnswer = async () => {
    if (isChecked || !currentExercise || !user) return;

    let correct = false;
    const ans = currentExercise.correctAnswer;

    if (currentExercise.type === 'multiple_choice') {
      correct = mcSelected.trim().toLowerCase() === String(ans).trim().toLowerCase();
    } else if (currentExercise.type === 'code_input') {
      correct = ciText.trim().toLowerCase() === String(ans).trim().toLowerCase();
    } else if (currentExercise.type === 'drag_drop') {
      if (Array.isArray(ans) && selectedTokens.length === ans.length) {
        correct = selectedTokens.every((token, idx) => token === ans[idx]);
      }
    }

    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      playTone('correct');
    } else {
      playTone('incorrect');
      const remainingHearts = await loseHeart();
      if (remainingHearts <= 0) {
        setShowOutOfHeartsModal(true);
      }
    }
  };

  const handleContinue = async () => {
    if (!currentExercise) return;

    if (currentIdx < exercises.length - 1) {
      const nextEx = exercises[currentIdx + 1];
      setCurrentIdx(currentIdx + 1);
      setupExercise(nextEx);
    } else {
      handleCompleteLesson();
    }
  };

  const handleCompleteLesson = async () => {
    try {
      setCompleting(true);
      const res = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setXpEarned(data.xpGained);
        await refreshUser();
        setLessonFinished(true);
      } else {
        setError('Failed to record lesson completion.');
      }
    } catch (err) {
      setError('Connection error completing lesson.');
    } finally {
      setCompleting(false);
    }
  };

  const handleRefillInModal = async () => {
    setRefillMsg('');
    setRefillLoading(true);
    const res = await refillHearts();
    setRefillLoading(false);

    if (res.success) {
      setRefillMsg('Refill complete!');
      setShowOutOfHeartsModal(false);
    } else {
      setRefillMsg(res.message || 'Could not refill. Make sure you have at least 50 XP.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#131F24] flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">Loading exercise workspace...</p>
      </div>
    );
  }

  if (error || !currentExercise) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#131F24] flex-col gap-3 p-4 text-center">
        <span className="material-symbols-outlined text-6xl text-brand-red">warning</span>
        <p className="font-extrabold text-on-surface text-lg">{error || 'Lesson not found'}</p>
        <button
          onClick={() => router.push('/learn')}
          className="px-6 py-3 bg-primary-container text-white font-button rounded-2xl flat-3d-button active-3d-button uppercase"
        >
          Trở Về Bản Đồ
        </button>
      </div>
    );
  }

  const progressPercent = exercises.length > 0 ? (currentIdx / exercises.length) * 100 : 0;

  // Render Finished screen
  if (lessonFinished) {
    return (
      <div className="min-h-screen bg-[#0f131f] text-white flex flex-col items-center justify-center p-6 text-center w-full relative overflow-hidden select-none">
        
        {/* Decorative Atmospheric Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-500/10 blur-[90px] rounded-full pointer-events-none"></div>

        {/* Ambient floating starbursts */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <span className="material-symbols-outlined text-yellow-400 absolute top-[15%] left-[20%] animate-pulse text-xl">sparkles</span>
          <span className="material-symbols-outlined text-yellow-300 absolute top-[25%] right-[25%] animate-ping text-lg" style={{ animationDuration: '3s' }}>grade</span>
          <span className="material-symbols-outlined text-amber-400 absolute bottom-[30%] left-[25%] animate-bounce text-2xl" style={{ animationDuration: '4s' }}>grade</span>
          <span className="material-symbols-outlined text-amber-300 absolute bottom-[20%] right-[20%] animate-pulse text-base">sparkles</span>
        </div>

        <div className="max-w-md w-full flex flex-col items-center z-10">
          
          {/* Trophy Header Badge */}
          <div className="relative mb-8">
            {/* Outer golden halo */}
            <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-2xl animate-pulse"></div>
            
            {/* Rotating golden outline rings */}
            <div className="absolute -inset-1 border-2 border-dashed border-yellow-400/40 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
            <div className="absolute -inset-2 border border-dotted border-amber-300/30 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>

            {/* Main Trophy Circle Container */}
            <div className="relative w-36 h-36 bg-surface-container border-4 border-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.25)] animate-float">
              <span className="material-symbols-outlined text-7xl text-yellow-400 fill-yellow-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                emoji_events
              </span>
            </div>
            
            {/* Pop-out little floating badges */}
            <div className="absolute -top-1 -right-1 bg-gradient-to-tr from-yellow-400 to-amber-500 text-on-secondary rounded-full w-8 h-8 flex items-center justify-center shadow-lg border border-white/20 animate-bounce" style={{ animationDelay: '0.3s' }}>
              <span className="material-symbols-outlined text-base font-black">done_all</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            Bài học hoàn thành!
          </h1>
          <p className="text-on-surface-variant/80 font-bold mb-8 text-sm leading-relaxed max-w-xs">
            Xuất sắc! Bạn đã vượt qua mọi thử thách, tích luỹ thêm tri thức và gặt hái phần thưởng xứng đáng.
          </p>

          {/* Duolingo style stats grid */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            {/* XP Stats Card */}
            <div className="bg-surface-container/60 backdrop-blur-md border-2 border-orange-500/20 rounded-3xl p-5 shadow-lg flex flex-col items-center hover:scale-[1.02] hover:border-orange-500/40 transition-all select-none">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-3 border border-orange-500/20 shadow-inner">
                <span className="material-symbols-outlined text-2xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <p className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1 select-none">KINH NGHIỆM</p>
              <p className="text-2xl font-extrabold text-orange-500">+{xpEarned} XP</p>
            </div>

            {/* Streak Stats Card */}
            <div className="bg-surface-container/60 backdrop-blur-md border-2 border-yellow-500/20 rounded-3xl p-5 shadow-lg flex flex-col items-center hover:scale-[1.02] hover:border-yellow-500/40 transition-all select-none">
              <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-3 border border-yellow-500/20 shadow-inner">
                <span className="material-symbols-outlined text-2xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <p className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1 select-none">CHUỖI STREAK</p>
              <p className="text-2xl font-extrabold text-yellow-500">{user?.streak || 0} ngày</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/learn')}
            className="w-full py-4 bg-[#58cc02] hover:brightness-110 text-white font-button rounded-2xl border-b-6 border-[#46a302] active:translate-y-1 active:border-b-2 font-black text-lg tracking-wider transition-all uppercase shadow-[0_8px_20px_-4px_rgba(88,204,2,0.3)]"
          >
            TIẾP TỤC HỌC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131F24] text-white flex flex-col justify-between overflow-hidden">
      
      {/* Header bar */}
      <header className="max-w-4xl w-full mx-auto px-6 py-6 flex items-center gap-6">
        <button
          onClick={() => router.push('/learn')}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-3xl font-black">close</span>
        </button>

        {/* Progress Bar */}
        <div className="flex-grow h-4 bg-[#374151] rounded-full overflow-hidden p-0.5 border border-[#374151]">
          <div
            className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="h-1.5 w-full bg-white opacity-20 mt-0.5 ml-2 rounded-full"></div>
          </div>
        </div>

        {/* Health/Hearts */}
        <div className="flex items-center gap-1.5 font-black text-[#ff4b4b] text-xl select-none">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          <span>{user?.hearts}</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow flex items-center justify-center w-full max-w-3xl mx-auto px-6 py-8 pb-32">
        <div className="w-full space-y-10">
          
          {/* Question Section Header */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-1.5 text-brand-purple font-black text-xs uppercase tracking-widest bg-brand-purple/10 px-3.5 py-1.5 rounded-full w-max border border-brand-purple/20">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                navigation
              </span>
              <span>
                {currentExercise.type === 'multiple_choice'
                  ? 'TRẮC NGHIỆM'
                  : currentExercise.type === 'code_input'
                  ? 'ĐIỀN VÀO CHỖ TRỐNG'
                  : 'SẮP XẾP KHỐI CODE'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide leading-snug whitespace-pre-line">
              {currentExercise.question}
            </h1>
          </div>

          {/* Answer Card Grid Area */}
          <div className="w-full min-h-[220px]">
            
            {/* 1. Multiple Choice Options */}
            {currentExercise.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {currentExercise.options.map((option, idx) => {
                  const isSelected = mcSelected === option;
                  return (
                    <div
                      key={idx}
                      onClick={() => !isChecked && setMcSelected(option)}
                      className={`option-card rounded-2xl p-5 flex flex-col items-center justify-between min-h-[200px] border-b-4 ${
                        isSelected
                          ? 'bg-[#1b2d41] border-[#1cb0f6] text-[#1cb0f6] shadow-inner'
                          : 'bg-[#131F24] border-[#374151] hover:bg-[#1e293b] text-on-surface'
                      } ${isChecked ? 'cursor-not-allowed pointer-events-none opacity-60' : 'cursor-pointer active-3d-button'}`}
                    >
                      {/* Placeholder Illustration / Centered Option text */}
                      <div className="w-full flex-grow flex items-center justify-center mb-4 text-center font-bold font-mono text-sm break-all">
                        {option}
                      </div>
                      <div className="w-full flex justify-between items-center px-1 border-t border-outline-variant/20 pt-3">
                        <span className="text-xs text-on-surface-variant font-black">LỰA CHỌN</span>
                        <span className={`hotkey-badge rounded-lg w-7 h-7 flex items-center justify-center text-xs font-black border-2 ${
                          isSelected ? 'border-[#1cb0f6] text-[#1cb0f6]' : 'border-[#374151] text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Code Input */}
            {currentExercise.type === 'code_input' && (
              <div className="bg-[#1b1f2c] rounded-3xl p-6 border-4 border-black/20 shadow-xl max-w-xl mx-auto">
                <div className="font-mono text-base space-y-4">
                  <div className="text-on-surface-variant/40 text-xs flex justify-between select-none border-b border-outline-variant/20 pb-3">
                    <span>Terminal / Code View</span>
                    <span>UTF-8</span>
                  </div>
                  <div className="pt-2 text-emerald-400">
                    <input
                      type="text"
                      placeholder="Nhập đoạn code còn thiếu..."
                      value={ciText}
                      onChange={(e) => setCiText(e.target.value)}
                      disabled={isChecked}
                      className="w-full bg-[#0f131f] border-2 border-[#374151] rounded-xl px-4 py-3 text-white outline-none focus:border-brand-green font-mono transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Drag Drop (Clickable Tokens) */}
            {currentExercise.type === 'drag_drop' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Result Area */}
                <div className="drop-zone border-4 border-dashed border-[#374151] bg-[#1b1f2c]/30 rounded-3xl p-4 flex flex-wrap gap-2.5 items-center">
                  {selectedTokens.length === 0 ? (
                    <span className="text-on-surface-variant/40 font-bold text-sm select-none p-2">
                      Gõ các khối code phía dưới theo thứ tự đúng...
                    </span>
                  ) : (
                    selectedTokens.map((token, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTokenRemove(token, idx)}
                        disabled={isChecked}
                        className="bg-[#1b2d41] border-2 border-[#1cb0f6] text-[#1cb0f6] font-mono font-bold px-4 py-2.5 rounded-xl text-sm shadow-[0_2.5px_0_#1cb0f6] active:translate-y-0.5"
                      >
                        {token}
                      </button>
                    ))
                  )}
                </div>

                {/* Available Pool */}
                <div className="flex flex-wrap justify-center gap-3 border-t border-[#374151] pt-6">
                  {availableTokens.map((token, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTokenSelect(token, idx)}
                      disabled={isChecked}
                      className="bg-[#131F24] border-2 border-[#374151] text-on-surface font-mono font-bold px-4 py-2.5 rounded-xl text-sm shadow-[0_2.5px_0_#374151] active:translate-y-0.5 hover:bg-[#1e293b]"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Bottom status action footer bar */}
      <footer
        className={`w-full border-t-2 fixed bottom-0 left-0 py-6 px-6 z-40 transition-colors ${
          isChecked
            ? isCorrect
              ? 'bg-[#183220] border-[#224f2b] text-white'
              : 'bg-[#3b1c1c] border-[#5a2a2a] text-white'
            : 'bg-[#131F24] border-[#374151]'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {isChecked ? (
              isCorrect ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-[#58cc02] fill-[#58cc02] animate-bounce">
                    check_circle
                  </span>
                  <div>
                    <h4 className="font-black text-lg text-[#58cc02]">Hoàn toàn chính xác!</h4>
                    <p className="text-xs text-[#58cc02] font-bold">Làm rất tốt, hãy tiếp tục.</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-[#ff4b4b] fill-[#ff4b4b] animate-bounce">
                    cancel
                  </span>
                  <div>
                    <h4 className="font-black text-lg text-[#ff4b4b]">Đáp án chưa chính xác</h4>
                    <p className="text-xs text-[#ff4b4b] font-bold">
                      Đúng là: {Array.isArray(currentExercise.correctAnswer)
                        ? currentExercise.correctAnswer.join(' ')
                        : String(currentExercise.correctAnswer)}
                    </p>
                  </div>
                </>
              )
            ) : (
              <p className="text-sm font-bold text-on-surface-variant/40">
                Hãy lựa chọn câu trả lời ở trên để kiểm tra.
              </p>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {!isChecked ? (
              <>
                <button
                  onClick={() => router.push('/learn')}
                  className="btn-skip px-8 py-3.5 rounded-2xl font-black text-[#afafaf] hover:bg-[#1e293b] border-2 border-[#374151] border-b-4 flex-1 sm:flex-none text-center"
                >
                  BỎ QUA
                </button>
                <button
                  onClick={handleCheckAnswer}
                  disabled={!hasAnswered()}
                  className={`px-8 py-3.5 rounded-2xl font-black border-b-4 text-center flex-1 sm:flex-none uppercase ${
                    hasAnswered()
                      ? 'bg-[#58cc02] text-white border-[#46a302] cursor-pointer'
                      : 'bg-[#374151] text-[#4b5563] border-[#1f2937] cursor-not-allowed'
                  }`}
                >
                  KIỂM TRA
                </button>
              </>
            ) : (
              <button
                onClick={handleContinue}
                className={`w-full sm:w-48 py-3.5 text-white font-black rounded-2xl border-b-4 text-center uppercase ${
                  isCorrect
                    ? 'bg-[#58cc02] hover:bg-[#46a302] border-[#46a302]'
                    : 'bg-brand-red hover:bg-red-500 border-red-800'
                }`}
              >
                TIẾP TỤC
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Out of Hearts Modal Overlay */}
      {showOutOfHeartsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1f2c] rounded-3xl p-8 max-w-sm w-full text-center border-2 border-[#374151] shadow-2xl relative animate-float">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <span className="material-symbols-outlined text-error text-5xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="material-symbols-outlined text-xs absolute -bottom-1 -right-1 bg-brand-red text-white rounded-full p-0.5 border-2 border-white">
                close
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">Hết Trái tim!</h3>
            <p className="text-on-surface-variant/80 font-bold text-sm mb-6 leading-relaxed">
              Trái tim tự động hồi phục sau mỗi 4 tiếng. Hoặc bạn có thể đổi lấy Trái tim ngay bằng Điểm kinh nghiệm!
            </p>

            {refillMsg && (
              <p className={`text-xs font-black text-center mb-4 ${
                refillMsg.includes('complete') ? 'text-brand-green' : 'text-brand-red'
              }`}>
                {refillMsg}
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleRefillInModal}
                disabled={refillLoading || (user ? user.xp < 50 : true)}
                className="w-full py-3.5 bg-brand-red hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none text-white font-black rounded-2xl border-b-4 border-red-800 shadow-[0_4px_0_#b91c1c] text-sm tracking-wide uppercase transition-colors"
              >
                {refillLoading ? 'Đang hồi phục...' : 'HỒI PHỤC (+5) • 50 XP'}
              </button>
              <button
                onClick={() => {
                  setShowOutOfHeartsModal(false);
                  router.push('/learn');
                }}
                className="w-full py-3 bg-[#131F24] hover:bg-[#1e293b] text-gray-400 border-2 border-[#374151] font-bold rounded-2xl text-sm transition-colors uppercase"
              >
                RỜI BÀI HỌC
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
