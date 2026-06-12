'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import TitleEditModal from '../../../../components/admin/TitleEditModal';
import ExerciseEditorModal, { Exercise } from '../../../../components/admin/ExerciseEditorModal';
import ChapterItem from '../../../../components/admin/ChapterItem';
import LessonItem from '../../../../components/admin/LessonItem';
import ExerciseItem from '../../../../components/admin/ExerciseItem';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  }, [token, authLoading, user, router]);

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

  // ================= EXERCISE CRUD & MODAL =================

  const handleOpenExerciseModal = (chapterId: string, lessonId: string, index: number, existingEx?: Exercise) => {
    if (existingEx) {
      setEditingExercise({
        chapterId,
        lessonId,
        index,
        exercise: { ...existingEx }
      });
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
    }
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
    <>
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
                chapters.map((chapter, chIdx) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    chIdx={chIdx}
                    isExpanded={!!expandedChapters[chapter.id]}
                    canMoveUp={chIdx > 0}
                    canMoveDown={chIdx < chapters.length - 1}
                    onToggleExpand={() => toggleChapter(chapter.id)}
                    onMoveUp={() => handleMoveChapter(chIdx, 'up')}
                    onMoveDown={() => handleMoveChapter(chIdx, 'down')}
                    onEditTitle={() => handleEditChapterTitle(chapter)}
                    onDelete={() => handleDeleteChapter(chapter.id)}
                  >
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
                            {chapter.lessons.map((lesson, leIdx) => (
                              <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                leIdx={leIdx}
                                chIdx={chIdx}
                                isExpanded={!!expandedLessons[lesson.id]}
                                canMoveUp={leIdx > 0}
                                canMoveDown={leIdx < chapter.lessons.length - 1}
                                onToggleExpand={() => toggleLesson(lesson.id)}
                                onMoveUp={() => handleMoveLesson(chapter.id, leIdx, 'up')}
                                onMoveDown={() => handleMoveLesson(chapter.id, leIdx, 'down')}
                                onEditTitle={() => handleEditLessonTitle(chapter.id, lesson)}
                                onDelete={() => handleDeleteLesson(chapter.id, lesson.id)}
                              >
                                <div className="p-3.5 bg-surface-container flex flex-col gap-3.5">
                                  {lesson.exercises?.length === 0 ? (
                                    <div className="p-4 text-center border border-dashed border-outline-variant/30 rounded-xl">
                                      <p className="text-[10px] text-on-surface-variant/70 italic font-semibold">Chưa có bài tập nào trong bài học này.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2.5">
                                      {lesson.exercises.map((exercise, exIdx) => (
                                        <ExerciseItem
                                          key={exIdx}
                                          exercise={exercise}
                                          exIdx={exIdx}
                                          canMoveUp={exIdx > 0}
                                          canMoveDown={exIdx < lesson.exercises.length - 1}
                                          onMoveUp={() => handleMoveExercise(chapter.id, lesson.id, exIdx, 'up')}
                                          onMoveDown={() => handleMoveExercise(chapter.id, lesson.id, exIdx, 'down')}
                                          onEdit={() => handleOpenExerciseModal(chapter.id, lesson.id, exIdx, exercise)}
                                          onDelete={() => handleDeleteExercise(chapter.id, lesson.id, exIdx)}
                                        />
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
                              </LessonItem>
                            ))}
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
                  </ChapterItem>
                ))
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

      {/* DIALOG: CHAPTER / LESSON TITLE CHANGE */}
      <TitleEditModal
        show={!!editingItem}
        type={editingItem?.type || 'chapter'}
        initialTitle={editingItem?.title || ''}
        onClose={() => setEditingItem(null)}
        onSave={(newTitle) => {
          if (!editingItem) return;
          const { type, chapterId, lessonId } = editingItem;
          if (!newTitle.trim()) {
            triggerAlert('Tên không được để trống', 'error');
            return;
          }

          if (type === 'chapter') {
            const updated = chapters.map(ch => {
              if (ch.id === chapterId) {
                return { ...ch, title: newTitle.trim() };
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
                  lessons: ch.lessons.map(l => (l.id === lessonId ? { ...l, title: newTitle.trim() } : l))
                };
              }
              return ch;
            });
            setChapters(updated);
            triggerAlert('Đã cập nhật tên bài học');
          }

          setEditingItem(null);
        }}
      />

      {/* DIALOG: EXERCISE CREATE / UPDATE */}
      {editingExercise && (
        <ExerciseEditorModal
          show={!!editingExercise}
          isNew={editingExercise.index === -1}
          initialExercise={editingExercise.exercise}
          onClose={() => setEditingExercise(null)}
          triggerAlert={triggerAlert}
          onSave={(finalExercise) => {
            const { chapterId, lessonId, index } = editingExercise;
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
          }}
        />
      )}

      {/* Reusable ConfirmDialog Component */}
      <ConfirmDialog
        show={confirmDialog?.show || false}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onCancel={() => setConfirmDialog(null)}
      />
    </>
  );
}
