'use client';

import React from 'react';

interface Lesson {
  id: string;
  title: string;
  exercises: any[];
}

interface LessonItemProps {
  lesson: Lesson;
  leIdx: number;
  chIdx: number;
  isExpanded: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditTitle: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export default function LessonItem({
  lesson,
  leIdx,
  chIdx,
  isExpanded,
  canMoveUp,
  canMoveDown,
  onToggleExpand,
  onMoveUp,
  onMoveDown,
  onEditTitle,
  onDelete,
  children,
}: LessonItemProps) {
  return (
    <div className="bg-surface-container-high border-2 border-outline-variant/15 rounded-2xl overflow-hidden flex flex-col shadow-inner">
      {/* Lesson Header */}
      <div className="bg-surface/60 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant/10">
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={onToggleExpand}
        >
          <span className="material-symbols-outlined text-on-surface-variant/60">
            {isExpanded ? 'expand_more' : 'chevron_right'}
          </span>
          <div>
            <h3 className="text-xs font-black text-on-surface flex items-center gap-2">
              <span className="text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                Bài {chIdx + 1}.{leIdx + 1}
              </span>
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
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
            title="Di chuyển lên"
          >
            <span className="material-symbols-outlined text-xs font-black">arrow_upward</span>
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
            title="Di chuyển xuống"
          >
            <span className="material-symbols-outlined text-xs font-black">arrow_downward</span>
          </button>
          <button
            onClick={onEditTitle}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-secondary active:translate-y-[1px] border border-black/10"
            title="Sửa tên bài"
          >
            <span className="material-symbols-outlined text-xs">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-brand-red active:translate-y-[1px] border border-black/10"
            title="Xóa bài"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
          </button>
        </div>
      </div>

      {/* Exercises List (Only if lesson expanded) */}
      {isExpanded && children}
    </div>
  );
}
