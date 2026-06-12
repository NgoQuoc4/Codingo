import React from 'react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!show) return null;

  return (
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
            {title}
          </h2>
          <p className="text-on-surface-variant font-semibold text-xs leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-3 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px] text-center"
          >
            HỦY BỎ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-brand-red hover:bg-red-500 text-white px-5 py-3 rounded-xl border-b-4 border-red-800 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px] text-center"
          >
            XÁC NHẬN
          </button>
        </div>
      </div>
    </div>
  );
}
