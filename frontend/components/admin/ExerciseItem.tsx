'use client';

import React from 'react';
import { Exercise } from './ExerciseEditorModal';

interface ExerciseItemProps {
  exercise: Exercise;
  exIdx: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ExerciseItem({
  exercise,
  exIdx,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ExerciseItemProps) {
  return (
    <div className="bg-surface-container-high border border-outline-variant/15 p-3 rounded-xl flex items-center justify-between gap-3 text-[11px] font-bold text-on-surface hover:bg-surface-bright transition-colors">
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
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright disabled:opacity-20 active:translate-y-[1px] flex items-center justify-center border border-black/5"
          title="Di chuyển lên"
        >
          <span className="material-symbols-outlined text-xs">arrow_upward</span>
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright disabled:opacity-20 active:translate-y-[1px] flex items-center justify-center border border-black/5"
          title="Di chuyển xuống"
        >
          <span className="material-symbols-outlined text-xs">arrow_downward</span>
        </button>
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright text-on-surface-variant hover:text-primary active:translate-y-[1px] flex items-center justify-center border border-black/5"
          title="Sửa câu hỏi"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded bg-surface-dim hover:bg-surface-bright text-on-surface-variant hover:text-brand-red active:translate-y-[1px] flex items-center justify-center border border-black/5"
          title="Xóa câu hỏi"
        >
          <span className="material-symbols-outlined text-xs">delete</span>
        </button>
      </div>
    </div>
  );
}
