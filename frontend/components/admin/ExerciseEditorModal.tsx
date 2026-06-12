'use client';

import React, { useState, useEffect } from 'react';

export interface Exercise {
  type: 'multiple_choice' | 'drag_drop' | 'code_input';
  question: string;
  options: string[];
  correctAnswer: any;
}

interface ExerciseEditorModalProps {
  show: boolean;
  isNew: boolean;
  initialExercise: Exercise;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  triggerAlert: (text: string, type?: 'success' | 'error') => void;
}

export default function ExerciseEditorModal({
  show,
  isNew,
  initialExercise,
  onClose,
  onSave,
  triggerAlert,
}: ExerciseEditorModalProps) {
  const [exercise, setExercise] = useState<Exercise>({ ...initialExercise });
  const [dragDropCorrectInput, setDragDropCorrectInput] = useState('');
  const [dragDropDistractorsInput, setDragDropDistractorsInput] = useState('');

  // Synchronize initial exercise states on show
  useEffect(() => {
    if (show) {
      setExercise({ ...initialExercise });

      if (initialExercise.type === 'drag_drop') {
        const correct = Array.isArray(initialExercise.correctAnswer)
          ? initialExercise.correctAnswer.join(', ')
          : '';
        const distractors = (initialExercise.options || [])
          .filter(o => !(initialExercise.correctAnswer || []).includes(o))
          .join(', ');
        setDragDropCorrectInput(correct);
        setDragDropDistractorsInput(distractors);
      } else {
        setDragDropCorrectInput('');
        setDragDropDistractorsInput('');
      }
    }
  }, [show, initialExercise]);

  if (!show) return null;

  const handleExerciseChange = (fields: Partial<Exercise>) => {
    setExercise(prev => ({
      ...prev,
      ...fields,
    }));
  };

  const handleOptionChange = (idx: number, val: string) => {
    const nextOptions = [...exercise.options];
    nextOptions[idx] = val;
    handleExerciseChange({ options: nextOptions });
  };

  const handleAddOption = () => {
    handleExerciseChange({ options: [...exercise.options, ''] });
  };

  const handleRemoveOption = (idx: number) => {
    const nextOptions = exercise.options.filter((_, i) => i !== idx);
    let nextCorrect = exercise.correctAnswer;
    if (nextCorrect === exercise.options[idx]) {
      nextCorrect = '';
    }
    handleExerciseChange({ options: nextOptions, correctAnswer: nextCorrect });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exercise.question.trim()) {
      triggerAlert('Vui lòng nhập câu hỏi', 'error');
      return;
    }

    const finalExercise: Exercise = { ...exercise };

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

      finalExercise.correctAnswer = correctTokens;
      finalExercise.options = Array.from(new Set([...correctTokens, ...distractorTokens]));
    }

    onSave(finalExercise);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto custom-scrollbar">
      <form 
        onSubmit={handleSubmit}
        className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-2xl w-full p-6 my-8 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <h2 className="font-headline-lg text-lg font-black uppercase text-on-surface mb-2 mt-2">
          {isNew ? 'Thêm Bài Tập Mới' : 'Sửa Bài Tập'}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-on-surface-variant uppercase font-black">Loại câu hỏi / bài tập</label>
          <select
            value={exercise.type}
            onChange={(e) => {
              const type = e.target.value as any;
              handleExerciseChange({
                type,
                options: type === 'multiple_choice' ? ['', ''] : [],
                correctAnswer: type === 'drag_drop' ? [] : '',
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
            value={exercise.question}
            onChange={(e) => handleExerciseChange({ question: e.target.value })}
            rows={3}
            className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors custom-scrollbar font-sans"
            placeholder="Nhập đề bài cho học viên (ví dụ: Khai báo hằng số số nguyên mười bằng ngôn ngữ JS?)"
            required
          />
        </div>

        {/* CONDITIONAL CONTROLS: MULTIPLE CHOICE */}
        {exercise.type === 'multiple_choice' && (
          <div className="space-y-3.5 border-t border-outline-variant/20 pt-3">
            <label className="text-[10px] text-on-surface-variant uppercase font-black block">Danh sách lựa chọn (Tích chọn để làm đáp án đúng)</label>
            <div className="flex flex-col gap-2.5">
              {exercise.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mcCorrectOption"
                    checked={exercise.correctAnswer === opt && opt !== ''}
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
                  {exercise.options.length > 2 && (
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
        {exercise.type === 'drag_drop' && (
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
        {exercise.type === 'code_input' && (
          <div className="space-y-3.5 border-t border-outline-variant/20 pt-3 flex flex-col gap-1.5">
            <label className="text-[10px] text-on-surface-variant uppercase font-black block mb-0.5">Đáp án code đúng (Chuỗi chính xác học viên phải nhập)</label>
            <textarea
              value={String(exercise.correctAnswer)}
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
            onClick={onClose}
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
  );
}
