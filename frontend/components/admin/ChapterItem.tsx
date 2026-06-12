'use client';

import React from 'react';

interface Chapter {
  id: string;
  title: string;
  lessons: any[];
}

interface ChapterItemProps {
  chapter: Chapter;
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

export default function ChapterItem({
  chapter,
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
}: ChapterItemProps) {
  return (
    <div className="bg-surface-container border-2 border-outline-variant/25 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      {/* Chapter Header */}
      <div className="bg-surface p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-outline-variant/15">
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={onToggleExpand}
        >
          <span className="material-symbols-outlined text-on-surface-variant/70">
            {isExpanded ? 'expand_more' : 'chevron_right'}
          </span>
          <div>
            <h2 className="text-sm font-black text-on-surface flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                Chương {chIdx + 1}
              </span>
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
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
            title="Di chuyển lên"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_upward</span>
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright disabled:opacity-20 hover:text-primary active:translate-y-[1px] border border-black/10"
            title="Di chuyển xuống"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_downward</span>
          </button>
          <button
            onClick={onEditTitle}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-secondary active:translate-y-[1px] border border-black/10"
            title="Sửa tiêu đề"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dim hover:bg-surface-bright hover:text-brand-red active:translate-y-[1px] border border-black/10"
            title="Xóa chương"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      {/* Chapter Lessons List (Only if expanded) */}
      {isExpanded && children}
    </div>
  );
}
