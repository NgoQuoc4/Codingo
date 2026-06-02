'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Sidebar from '../../../../components/Navbar';

interface Exercise {
  type: 'multiple_choice' | 'drag_drop' | 'code_input';
  question: string;
  options: string[];
  correctAnswer: any; // string (multiple_choice, code_input) or string[] (drag_drop)
}

interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Practice {
  id: string;
  title: string;
  language: string;
  description: string;
  chapters: Chapter[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to generate a 24-char hex string to use as MongoDB ObjectId on the client side
const generateObjectId = (): string => {
  const hexChars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
  }
  return result;
};

export default function PracticeEditorPage() {
  const { id } = useParams() as { id: string };
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Content state
  const [practice, setPractice] = useState<Practice | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Expand/collapse states for chapters and lessons
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  // Dialog/modal states for editing chapter/lesson titles
  const [editingItem, setEditingItem] = useState<{ type: 'chapter' | 'lesson'; chapterId: string; lessonId?: string; title: string } | null>(null);

  // Exercise modal states
  const [editingExercise, setEditingExercise] = useState<{
    chapterId: string;
    lessonId: string;
    index: number; // -1 for adding new, >= 0 for editing
    exercise: Exercise;
  } | null>(null);

  // Form states for drag_drop helper inside the exercise modal
  const [dragDropCorrectInput, setDragDropCorrectInput] = useState('');
  const [dragDropDistractorsInput, setDragDropDistractorsInput] = useState('');

  // Toast / alert banner state
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Route protection
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/learn');
    }
  }, [token, authLoading, user]);

  // Load practice details
  useEffect(() => {
    if (authLoading || !token || (user && user.role !== 'admin')) return;
    fetchPracticeDetails();
  }, [id, token, authLoading, user]);

  const fetchPracticeDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/practices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Lộ trình không tồn tại hoặc lỗi kết nối');
      }

      const data = await res.json();
      if (data && data.course) {
        const courseData = data.course;
        // Normalize backend chapters to ensure matching ids
        const normalizedChapters = (courseData.chapters || []).map((ch: any) => ({
          id: ch.id || ch._id,
          title: ch.title,
          lessons: (ch.lessons || []).map((le: any) => ({
            id: le.id || le._id,
            title: le.title,
            exercises: (le.exercises || []).map((ex: any) => ({
              type: ex.type,
              question: ex.question || '',
              options: ex.options || [],
              correctAnswer: ex.correctAnswer
            }))
          }))
        }));

        setPractice({
          id: courseData.id || courseData._id,
          title: courseData.title,
          language: courseData.language,
          description: courseData.description || '',
          chapters: normalizedChapters
        });
        setChapters(normalizedChapters);

        // Expand first chapter by default if available
        if (normalizedChapters.length > 0) {
          setExpandedChapters({ [normalizedChapters[0].id]: true });
        }
      } else {
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // ================= CHAPTER CRUD =================

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: generateObjectId(),
      title: `Chương mới ${chapters.length + 1}`,
      lessons: []
    };
    const updated = [...chapters, newChapter];
    setChapters(updated);
    setExpandedChapters(prev => ({ ...prev, [newChapter.id]: true }));
    triggerAlert('Đã thêm chương mới');
  };

  const handleEditChapterTitle = (chapter: Chapter) => {
    setEditingItem({
      type: 'chapter',
      chapterId: chapter.id,
      title: chapter.title
    });
  };

  const handleDeleteChapter = (chapterId: string) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa Chương Học',
      message: 'Bạn có chắc chắn muốn xóa chương này cùng toàn bộ bài học và bài tập bên trong? Thao tác không thể khôi phục.',
      onConfirm: () => {
        setConfirmDialog(null);
        const updated = chapters.filter(ch => ch.id !== chapterId);
        setChapters(updated);
        triggerAlert('Đã xóa chương', 'success');
      }
    });
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const updated = [...chapters];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setChapters(updated);
  };

  // ================= LESSON CRUD =================

  const handleAddLesson = (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    const newLesson: Lesson = {
      id: generateObjectId(),
      title: `Bài học mới ${chapter.lessons.length + 1}`,
      exercises: []
    };

    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, lessons: [...ch.lessons, newLesson] };
      }
      return ch;
    });

    setChapters(updated);
    setExpandedLessons(prev => ({ ...prev, [newLesson.id]: true }));
    triggerAlert('Đã thêm bài học mới');
  };

  const handleEditLessonTitle = (chapterId: string, lesson: Lesson) => {
    setEditingItem({
      type: 'lesson',
      chapterId,
      lessonId: lesson.id,
      title: lesson.title
    });
  };

  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa Bài Học',
      message: 'Bạn có chắc chắn muốn xóa bài học này cùng toàn bộ câu hỏi? Thao tác không thể khôi phục.',
      onConfirm: () => {
        setConfirmDialog(null);
        const updated = chapters.map(ch => {
          if (ch.id === chapterId) {
            return { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) };
          }
          return ch;
        });
        setChapters(updated);
        triggerAlert('Đã xóa bài học', 'success');
      }
    });
  };

  const handleMoveLesson = (chapterId: string, index: number, direction: 'up' | 'down') => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapter.lessons.length) return;

    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        const nextLessons = [...ch.lessons];
        const temp = nextLessons[index];
        nextLessons[index] = nextLessons[targetIndex];
        nextLessons[targetIndex] = temp;
        return { ...ch, lessons: nextLessons };
      }
      return ch;
    });

    setChapters(updated);
  };

  // Save changes to title (modal trigger)
  const handleSaveTitleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { type, chapterId, lessonId, title } = editingItem;
    if (!title.trim()) {
      triggerAlert('Tên không được để trống', 'error');
      return;
    }

    if (type === 'chapter') {
      const updated = chapters.map(ch => {
        if (ch.id === chapterId) {
          return { ...ch, title: title.trim() };
        }
        return ch;
      });
      setChapters(updated);
      triggerAlert('Đã cập nhật tên chương');
    } else if (type === 'lesson' && lessonId) {
      const updated = chapters.map(ch => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.map(l => (l.id === lessonId ? { ...l, title: title.trim() } : l))
          };
        }
        return ch;
      });
      setChapters(updated);
      triggerAlert('Đã cập nhật tên bài học');
    }

    setEditingItem(null);
  };

  // ================= EXERCISE CRUD & MODAL =================

  const handleOpenExerciseModal = (chapterId: string, lessonId: string, index: number, existingEx?: Exercise) => {
    if (existingEx) {
      setEditingExercise({
        chapterId,
        lessonId,
        index,
        exercise: { ...existingEx }
      });
      if (existingEx.type === 'drag_drop') {
        const correct = Array.isArray(existingEx.correctAnswer) ? existingEx.correctAnswer.join(', ') : '';
        const distractors = (existingEx.options || []).filter(o => !(existingEx.correctAnswer || []).includes(o)).join(', ');
        setDragDropCorrectInput(correct);
        setDragDropDistractorsInput(distractors);
      } else {
        setDragDropCorrectInput('');
        setDragDropDistractorsInput('');
      }
    } else {
      setEditingExercise({
        chapterId,
        lessonId,
        index: -1,
        exercise: {
          type: 'multiple_choice',
          question: '',
          options: ['', ''],
          correctAnswer: ''
        }
      });
      setDragDropCorrectInput('');
      setDragDropDistractorsInput('');
    }
  };

  const handleExerciseChange = (fields: Partial<Exercise>) => {
    if (!editingExercise) return;
    setEditingExercise({
      ...editingExercise,
      exercise: {
        ...editingExercise.exercise,
        ...fields
      }
    });
  };

  const handleOptionChange = (idx: number, val: string) => {
    if (!editingExercise) return;
    const nextOptions = [...editingExercise.exercise.options];
    nextOptions[idx] = val;
    handleExerciseChange({ options: nextOptions });
  };

  const handleAddOption = () => {
    if (!editingExercise) return;
    handleExerciseChange({ options: [...editingExercise.exercise.options, ''] });
  };

  const handleRemoveOption = (idx: number) => {
    if (!editingExercise) return;
    const nextOptions = editingExercise.exercise.options.filter((_, i) => i !== idx);
    let nextCorrect = editingExercise.exercise.correctAnswer;
    if (nextCorrect === editingExercise.exercise.options[idx]) {
      nextCorrect = '';
    }
    handleExerciseChange({ options: nextOptions, correctAnswer: nextCorrect });
  };

  const handleSaveExerciseModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;

    const { chapterId, lessonId, index, exercise } = editingExercise;

    if (!exercise.question.trim()) {
      triggerAlert('Vui lòng nhập câu hỏi', 'error');
      return;
    }

    let finalExercise: Exercise = { ...exercise };

    if (exercise.type === 'multiple_choice') {
      const activeOptions = exercise.options.map(o => o.trim()).filter(Boolean);
      if (activeOptions.length < 2) {
        triggerAlert('Cần tối thiểu 2 lựa chọn có chữ', 'error');
        return;
      }
      if (!exercise.correctAnswer || !activeOptions.includes(String(exercise.correctAnswer).trim())) {
        triggerAlert('Vui lòng chọn 1 đáp án đúng trong các lựa chọn', 'error');
        return;
      }
      finalExercise.options = activeOptions;
      finalExercise.correctAnswer = String(exercise.correctAnswer).trim();
    } else if (exercise.type === 'code_input') {
      if (!String(exercise.correctAnswer).trim()) {
        triggerAlert('Vui lòng điền đáp án code chính xác', 'error');
        return;
      }
      finalExercise.options = [];
      finalExercise.correctAnswer = String(exercise.correctAnswer).trim();
    } else if (exercise.type === 'drag_drop') {
      const correctTokens = dragDropCorrectInput.split(',').map(s => s.trim()).filter(Boolean);
      const distractorTokens = dragDropDistractorsInput.split(',').map(s => s.trim()).filter(Boolean);

      if (correctTokens.length === 0) {
        triggerAlert('Vui lòng nhập đáp án đúng gồm các token', 'error');
        return;
      }

      // Combine for the options pool
      finalExercise.correctAnswer = correctTokens;
      finalExercise.options = Array.from(new Set([...correctTokens, ...distractorTokens]));
    }

    // Update in local chapters state
    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              let nextExercises = [...l.exercises];
              if (index === -1) {
                nextExercises.push(finalExercise);
              } else {
                nextExercises[index] = finalExercise;
              }
              return { ...l, exercises: nextExercises };
            }
            return l;
          })
        };
      }
      return ch;
    });

    setChapters(updated);
    setEditingExercise(null);
    triggerAlert(index === -1 ? 'Đã thêm câu hỏi thành công' : 'Đã cập nhật câu hỏi thành công');
  };

  const handleDeleteExercise = (chapterId: string, lessonId: string, index: number) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa Bài Tập Câu Hỏi',
      message: 'Bạn có chắc chắn muốn xóa bài tập này?',
      onConfirm: () => {
        setConfirmDialog(null);
        const updated = chapters.map(ch => {
          if (ch.id === chapterId) {
            return {
              ...ch,
              lessons: ch.lessons.map(l => {
                if (l.id === lessonId) {
                  return {
                    ...l,
                    exercises: l.exercises.filter((_, i) => i !== index)
                  };
                }
                return l;
              })
            };
          }
          return ch;
        });
        setChapters(updated);
        triggerAlert('Đã xóa bài tập', 'success');
      }
    });
  };

  const handleMoveExercise = (chapterId: string, lessonId: string, index: number, direction: 'up' | 'down') => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    const lesson = chapter.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lesson.exercises.length) return;

    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              const nextExs = [...l.exercises];
              const temp = nextExs[index];
              nextExs[index] = nextExs[targetIndex];
              nextExs[targetIndex] = temp;
              return { ...l, exercises: nextExs };
            }
            return l;
          })
        };
      }
      return ch;
    });

    setChapters(updated);
  };

  // ================= SAVE TO DATABASE =================

  const handleSaveChangesToDb = async () => {
    if (saving || !practice) return;
    setSaving(true);

    try {
      // Map correctly to match Prisma expected document structure (using mapped 'id' for validation)
      const payloadChapters = chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        lessons: ch.lessons.map(l => ({
          id: l.id,
          title: l.title,
          exercises: l.exercises.map(ex => ({
            type: ex.type,
            question: ex.question,
            options: ex.options || [],
            correctAnswer: ex.correctAnswer
          }))
        }))
      }));

      const res = await fetch(`${API_URL}/admin/practices/${id}/chapters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ chapters: payloadChapters })
      });

      if (res.ok) {
        triggerAlert('Lưu toàn bộ thay đổi thành công!', 'success');
        // Refresh details to sync with DB
        fetchPracticeDetails();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi server khi lưu thông tin');
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Không thể lưu thay đổi vào DB', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">Kiểm tra quyền hạn quản trị...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative select-none">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col h-screen overflow-hidden">
        
        {/* Alerts banner */}
        {alertMsg && (
          <div className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 border-2 border-b-6 transition-all duration-300 backdrop-blur-md transform translate-y-0 scale-100 ${
            alertMsg.type === 'success' 
              ? 'bg-[#111e15]/95 border-emerald-500/30 border-b-emerald-500 text-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.15)]' 
              : 'bg-[#211212]/95 border-red-500/30 border-b-red-500 text-red-400 shadow-[0_8px_30px_rgba(239,68,68,0.15)]'
          }`}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {alertMsg.type === 'success' ? 'check_circle' : 'cancel'}
            </span>
            <span className="font-black text-[11px] uppercase tracking-widest leading-none">{alertMsg.text}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 relative flex flex-col">
          {/* Header */}
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-outline-variant/20 pb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/admin')}
                className="bg-surface-container hover:bg-surface-bright text-on-surface border-2 border-black/10 w-10 h-10 rounded-2xl flex items-center justify-center active:translate-y-[2px] transition-transform"
                title="Quay lại"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-lg text-xl md:text-2xl font-black text-on-surface">
                    {practice?.title || 'Quản lý lộ trình'}
                  </h1>
                  {practice && (
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-primary-container text-on-primary-container">
                      {practice.language}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant/70 font-semibold line-clamp-1 max-w-xl">
                  {practice?.description || 'Chi tiết nội dung học & bài tập luyện tập.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveChangesToDb}
              disabled={loading || saving}
              className="bg-secondary text-on-secondary font-button px-5 py-3 rounded-2xl border-b-4 border-secondary-dark flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs font-black shadow-lg"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  <span>ĐANG LƯU...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-black">save</span>
                  <span>LƯU THAY ĐỔI</span>
                </>
              )}
            </button>
          </header>

          {/* Loader or Error */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-2">
              <span className="material-symbols-outlined text-4xl text-secondary animate-spin">refresh</span>
              <p className="text-xs font-bold text-on-surface-variant">Đang tải dữ liệu bài học...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
              <span className="material-symbols-outlined text-4xl text-brand-red">error</span>
              <p className="text-sm font-black text-brand-red">{error}</p>
              <button 
                onClick={fetchPracticeDetails}
                className="bg-surface-container border-2 border-black/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-bright"
              >
                Tải lại
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6 max-w-5xl">
              
              {/* Chapters Tree container */}
              <div className="space-y-4">
                {chapters.length === 0 ? (
                  <div className="bg-surface-container border-2 border-dashed border-outline-variant/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">folder_open</span>
                    <p className="text-xs text-on-surface-variant/70 font-bold">Lộ trình này chưa có chương học nào.</p>
                    <button
                      onClick={handleAddChapter}
                      className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold border-b-2 border-primary-dark"
                    >
                      Thêm chương đầu tiên
                    </button>
                  </div>
                ) : (
                  chapters.map((chapter, chIdx) => {
                    const isChExpanded = expandedChapters[chapter.id];
                    return (
                      <div 
                        key={chapter.id}
                        className="bg-surface-container border-2 border-outline-variant/25 rounded-3xl overflow-hidden shadow-sm flex flex-col"
                      >
                        {/* Chapter Header */}
                        <div className="bg-surface p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-outline-variant/15">
                          <div 
                            className="flex items-center gap-3 cursor-pointer flex-1"
                            onClick={() => toggleChapter(chapter.id)}
                          >
                            <span className="material-symbols-outlined text-on-surface-variant/70">
                              {isChExpanded ? 'expand_more' : 'chevron_right'}
                            </span>
                            <div>
                              <h2 className="text-sm font-black text-on-surface flex items-center gap-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">Chương {chIdx + 1}</span>
                                {chapter.title}
                              </h2>
                              <p className="text-[10px] text-on-surface-variant/65 font-bold uppercase tracking-wider mt-0.5">
                                {chapter.lessons?.length || 0} bài học
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveChapter(chIdx, 'up')}
                              disabled={chIdx === 0}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
                              title="Di chuyển lên"
                            >
                              <span className="material-symbols-outlined text-sm font-black">arrow_upward</span>
                            </button>
                            <button
                              onClick={() => handleMoveChapter(chIdx, 'down')}
                              disabled={chIdx === chapters.length - 1}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
                              title="Di chuyển xuống"
                            >
                              <span className="material-symbols-outlined text-sm font-black">arrow_downward</span>
                            </button>
                            <button
                              onClick={() => handleEditChapterTitle(chapter)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-secondary active:translate-y-[1px] border border-black/10"
                              title="Sửa tiêu đề"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-brand-red active:translate-y-[1px] border border-black/10"
                              title="Xóa chương"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Chapter Lessons List (Only if expanded) */}
                        {isChExpanded && (
                          <div className="p-4 bg-surface-container-low flex flex-col gap-4">
                            {chapter.lessons?.length === 0 ? (
                              <div className="p-6 text-center border border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center gap-2">
                                <p className="text-[11px] text-on-surface-variant/70 italic font-semibold">Chưa có bài học nào trong chương này.</p>
                                <button
                                  onClick={() => handleAddLesson(chapter.id)}
                                  className="bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-primary/30"
                                >
                                  + Thêm bài học mới
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-3">
                                  {chapter.lessons.map((lesson, leIdx) => {
                                    const isLeExpanded = expandedLessons[lesson.id];
                                    return (
                                      <div 
                                        key={lesson.id}
                                        className="bg-surface-container-high border-2 border-outline-variant/15 rounded-2xl overflow-hidden flex flex-col shadow-inner"
                                      >
                                        {/* Lesson Header */}
                                        <div className="bg-surface/60 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant/10">
                                          <div 
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                            onClick={() => toggleLesson(lesson.id)}
                                          >
                                            <span className="material-symbols-outlined text-on-surface-variant/60">
                                              {isLeExpanded ? 'expand_more' : 'chevron_right'}
                                            </span>
                                            <div>
                                              <h3 className="text-xs font-black text-on-surface flex items-center gap-2">
                                                <span className="text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">Bài {chIdx + 1}.{leIdx + 1}</span>
                                                {lesson.title}
                                              </h3>
                                              <p className="text-[9px] text-on-surface-variant/60 font-bold uppercase tracking-wider mt-0.5">
                                                {lesson.exercises?.length || 0} bài tập (câu hỏi)
                                              </p>
                                            </div>
                                          </div>

                                          {/* Lesson Actions */}
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleMoveLesson(chapter.id, leIdx, 'up')}
                                              disabled={leIdx === 0}
                                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
                                              title="Di chuyển lên"
                                            >
                                              <span className="material-symbols-outlined text-xs font-black">arrow_upward</span>
                                            </button>
                                            <button
                                              onClick={() => handleMoveLesson(chapter.id, leIdx, 'down')}
                                              disabled={leIdx === chapter.lessons.length - 1}
                                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
                                              title="Di chuyển xuống"
                                            >
                                              <span className="material-symbols-outlined text-xs font-black">arrow_downward</span>
                                            </button>
                                            <button
                                              onClick={() => handleEditLessonTitle(chapter.id, lesson)}
                                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-secondary active:translate-y-[1px] border border-black/10"
                                              title="Sửa tên bài"
                                            >
                                              <span className="material-symbols-outlined text-xs">edit</span>
                                            </button>
                                            <button
                                              onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-brand-red active:translate-y-[1px] border border-black/10"
                                              title="Xóa bài"
                                            >
                                              <span className="material-symbols-outlined text-xs">delete</span>
                                            </button>
                                          </div>
                                        </div>

                                        {/* Exercises List (Only if lesson expanded) */}
                                        {isLeExpanded && (
                                          <div className="p-3.5 bg-surface-container flex flex-col gap-3.5">
                                            {lesson.exercises?.length === 0 ? (
                                              <div className="p-4 text-center border border-dashed border-outline-variant/30 rounded-xl">
                                                <p className="text-[10px] text-on-surface-variant/70 italic font-semibold">Chưa có bài tập nào trong bài học này.</p>
                                              </div>
                                            ) : (
                                              <div className="grid grid-cols-1 gap-2.5">
                                                {lesson.exercises.map((exercise, exIdx) => (
                                                  <div 
                                                    key={exIdx}
                                                    className="bg-surface-container-high border border-outline-variant/15 p-3 rounded-xl flex items-center justify-between gap-3 text-[11px] font-bold text-on-surface hover:bg-surface-bright transition-colors"
                                                  >
                                                    <div className="flex-1 space-y-1.5">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-[9px] uppercase font-black text-on-surface-variant/40">Câu hỏi {exIdx + 1}</span>
                                                        <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black uppercase border ${
                                                          exercise.type === 'multiple_choice' 
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                                                            : exercise.type === 'drag_drop'
                                                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/25'
                                                            : 'bg-sky-500/10 text-sky-500 border-sky-500/25'
                                                        }`}>
                                                          {exercise.type === 'multiple_choice' ? 'Trắc nghiệm' : exercise.type === 'drag_drop' ? 'Kéo thả' : 'Điền code'}
                                                        </span>
                                                      </div>
                                                      <p className="text-on-surface-variant font-semibold line-clamp-1">{exercise.question}</p>
                                                      <p className="text-[9px] text-on-surface-variant/60 font-medium">
                                                        Đáp án đúng:{' '}
                                                        <span className="text-secondary font-black bg-secondary/5 px-1.5 py-0.5 rounded border border-secondary/15">
                                                          {Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer.join(' | ') : String(exercise.correctAnswer)}
                                                        </span>
                                                      </p>
                                                    </div>

                                                    {/* Exercise Actions */}
                                                    <div className="flex gap-1 items-center">
                                                      <button
                                                        onClick={() => handleMoveExercise(chapter.id, lesson.id, exIdx, 'up')}
                                                        disabled={exIdx === 0}
                                                        className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright disabled:opacity-20 active:translate-y-[1px] flex items-center justify-center border border-black/5"
                                                        title="Di chuyển lên"
                                                      >
                                                        <span className="material-symbols-outlined text-xs">arrow_upward</span>
                                                      </button>
                                                      <button
                                                        onClick={() => handleMoveExercise(chapter.id, lesson.id, exIdx, 'down')}
                                                        disabled={exIdx === lesson.exercises.length - 1}
                                                        className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright disabled:opacity-20 active:translate-y-[1px] flex items-center justify-center border border-black/5"
                                                        title="Di chuyển xuống"
                                                      >
                                                        <span className="material-symbols-outlined text-xs">arrow_downward</span>
                                                      </button>
                                                      <button
                                                        onClick={() => handleOpenExerciseModal(chapter.id, lesson.id, exIdx, exercise)}
                                                        className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright text-on-surface-variant hover:text-primary active:translate-y-[1px] flex items-center justify-center border border-black/5"
                                                        title="Sửa câu hỏi"
                                                      >
                                                        <span className="material-symbols-outlined text-xs">edit</span>
                                                      </button>
                                                      <button
                                                        onClick={() => handleDeleteExercise(chapter.id, lesson.id, exIdx)}
                                                        className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright text-on-surface-variant hover:text-brand-red active:translate-y-[1px] flex items-center justify-center border border-black/5"
                                                        title="Xóa câu hỏi"
                                                      >
                                                        <span className="material-symbols-outlined text-xs">delete</span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            <button
                                              onClick={() => handleOpenExerciseModal(chapter.id, lesson.id, -1)}
                                              className="bg-primary text-on-primary font-button px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:brightness-110 active:translate-y-[2px] border-b-2 border-primary-dark text-[10px] font-black uppercase self-start"
                                            >
                                              <span className="material-symbols-outlined text-xs font-black">add_circle</span>
                                              THÊM BÀI TẬP CÂU HỎI
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <button
                                  onClick={() => handleAddLesson(chapter.id)}
                                  className="bg-primary text-on-primary font-button px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:brightness-110 active:translate-y-[2px] border-b-2 border-primary-dark text-[10px] font-black uppercase self-start"
                                >
                                  <span className="material-symbols-outlined text-xs font-black">add</span>
                                  THÊM BÀI HỌC MỚI
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {chapters.length > 0 && (
                  <button
                    onClick={handleAddChapter}
                    className="bg-primary text-on-primary font-button px-5 py-3 rounded-2xl border-b-4 border-primary-dark flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs font-black shadow-md mt-4"
                  >
                    <span className="material-symbols-outlined text-sm font-black">create_new_folder</span>
                    <span>THÊM CHƯƠNG MỚI</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Decorative backgrounds */}
          <div className="absolute inset-0 pointer-events-none z-[-1] opacity-20 overflow-hidden">
            <div className="absolute top-20 -left-20 w-80 h-80 bg-secondary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-primary/10 blur-[140px] rounded-full"></div>
          </div>
        </main>
      </div>

      {/* DIALOG: CHAPTER / LESSON TITLE CHANGE */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <form 
            onSubmit={handleSaveTitleChange}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-sm w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg font-black uppercase text-on-surface mb-2 mt-2">
              Sửa Tiêu Đề
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Tên {editingItem.type === 'chapter' ? 'chương' : 'bài học'} mới
              </label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-2.5 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl border-b-4 border-secondary-dark active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                CẬP NHẬT
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DIALOG: EXERCISE CREATE / UPDATE */}
      {editingExercise && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          <form 
            onSubmit={handleSaveExerciseModal}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-2xl w-full p-6 my-8 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingExercise(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg font-black uppercase text-on-surface mb-2 mt-2">
              {editingExercise.index === -1 ? 'Thêm Bài Tập Mới' : 'Sửa Bài Tập'}
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">Loại câu hỏi / bài tập</label>
              <select
                value={editingExercise.exercise.type}
                onChange={(e) => {
                  const type = e.target.value as any;
                  // reset options/correct answer structure appropriately when changing types
                  handleExerciseChange({
                    type,
                    options: type === 'multiple_choice' ? ['', ''] : [],
                    correctAnswer: type === 'drag_drop' ? [] : ''
                  });
                }}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="multiple_choice">Trắc nghiệm (Multiple Choice)</option>
                <option value="drag_drop">Kéo thả (Drag & Drop / Word Bank)</option>
                <option value="code_input">Điền code (Code Input / Text Entry)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">Câu hỏi / Đề bài</label>
              <textarea
                value={editingExercise.exercise.question}
                onChange={(e) => handleExerciseChange({ question: e.target.value })}
                rows={3}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors custom-scrollbar font-sans"
                placeholder="Nhập đề bài cho học viên (ví dụ: Khai báo hằng số số nguyên mười bằng ngôn ngữ JS?)"
                required
              />
            </div>

            {/* CONDITIONAL CONTROLS: MULTIPLE CHOICE */}
            {editingExercise.exercise.type === 'multiple_choice' && (
              <div className="space-y-3.5 border-t border-outline-variant/20 pt-3">
                <label className="text-[10px] text-on-surface-variant uppercase font-black block">Danh sách lựa chọn (Tích chọn để làm đáp án đúng)</label>
                <div className="flex flex-col gap-2.5">
                  {editingExercise.exercise.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="mcCorrectOption"
                        checked={editingExercise.exercise.correctAnswer === opt && opt !== ''}
                        onChange={() => handleExerciseChange({ correctAnswer: opt })}
                        className="w-4 h-4 text-secondary focus:ring-secondary accent-secondary cursor-pointer"
                        title="Đặt làm đáp án đúng"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                        className="flex-1 bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                        placeholder={`Lựa chọn ${oIdx + 1}`}
                        required
                      />
                      {editingExercise.exercise.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(oIdx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright text-brand-red active:translate-y-[1px] border border-black/10"
                          title="Xóa lựa chọn"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-primary/20 text-primary border border-primary/30 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-primary/30 mt-2"
                >
                  + THÊM LỰA CHỌN
                </button>
              </div>
            )}

            {/* CONDITIONAL CONTROLS: DRAG AND DROP */}
            {editingExercise.exercise.type === 'drag_drop' && (
              <div className="space-y-3.5 border-t border-outline-variant/20 pt-3">
                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase font-black block mb-1">Đáp án đúng (Các token theo đúng thứ tự)</label>
                  <input
                    type="text"
                    value={dragDropCorrectInput}
                    onChange={(e) => setDragDropCorrectInput(e.target.value)}
                    className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                    placeholder="Nhập các token, cách nhau bằng dấu phẩy. Ví dụ: let, x, =, 10"
                    required
                  />
                  <p className="text-[9px] text-on-surface-variant/65 mt-1 font-medium italic">
                    Gợi ý: Mỗi dấu phẩy ngăn cách một mảnh ghép từ mà học viên phải xếp theo hàng.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase font-black block mb-1">Từ gây nhiễu / Distractors (Mảnh ghép phụ - Không bắt buộc)</label>
                  <input
                    type="text"
                    value={dragDropDistractorsInput}
                    onChange={(e) => setDragDropDistractorsInput(e.target.value)}
                    className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                    placeholder="Ví dụ: const, var, 100, float"
                  />
                  <p className="text-[9px] text-on-surface-variant/65 mt-1 font-medium italic">
                    Hệ thống sẽ trộn tất cả đáp án đúng và từ gây nhiễu để hiển thị cho học viên.
                  </p>
                </div>
              </div>
            )}

            {/* CONDITIONAL CONTROLS: CODE INPUT */}
            {editingExercise.exercise.type === 'code_input' && (
              <div className="space-y-3.5 border-t border-outline-variant/20 pt-3 flex flex-col gap-1.5">
                <label className="text-[10px] text-on-surface-variant uppercase font-black block mb-0.5">Đáp án code đúng (Chuỗi chính xác học viên phải nhập)</label>
                <textarea
                  value={String(editingExercise.exercise.correctAnswer)}
                  onChange={(e) => handleExerciseChange({ correctAnswer: e.target.value })}
                  rows={3}
                  className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors font-mono text-xs leading-relaxed"
                  placeholder="Ví dụ: let x = 5;"
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-2.5 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl border-b-4 border-secondary-dark active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                XÁC NHẬN
              </button>
            </div>
          </form>
        </div>
      )}
      {/* MODAL: CUSTOM 3D CONFIRMATION DIALOG */}
      {confirmDialog && confirmDialog.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div 
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-sm w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-500/10 text-brand-red rounded-full flex items-center justify-center mx-auto border-2 border-brand-red/30 shadow-inner">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div className="text-center space-y-1.5">
              <h2 className="font-headline-lg text-base font-black uppercase text-on-surface">
                {confirmDialog.title}
              </h2>
              <p className="text-on-surface-variant font-semibold text-xs leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-3 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px] text-center"
              >
                HỦY BỎ
              </button>
              <button
                type="button"
                onClick={() => confirmDialog.onConfirm()}
                className="flex-1 bg-brand-red hover:bg-red-500 text-white px-5 py-3 rounded-xl border-b-4 border-red-800 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px] text-center"
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
