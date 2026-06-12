'use client';

import React, { useState, useEffect } from 'react';

interface TitleEditModalProps {
  show: boolean;
  type: 'chapter' | 'lesson';
  initialTitle: string;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export default function TitleEditModal({
  show,
  type,
  initialTitle,
  onClose,
  onSave,
}: TitleEditModalProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (show) {
      setTitle(initialTitle);
    }
  }, [show, initialTitle]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <form 
        onSubmit={handleSubmit}
        className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-sm w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
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
          Sửa Tiêu Đề
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-on-surface-variant uppercase font-black">
            Tên {type === 'chapter' ? 'chương' : 'bài học'} mới
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
            required
            autoFocus
          />
        </div>

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
            CẬP NHẬT
          </button>
        </div>
      </form>
    </div>
  );
}
