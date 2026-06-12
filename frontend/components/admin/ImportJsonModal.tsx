'use client';

import React, { useState, useEffect } from 'react';

interface ImportJsonModalProps {
  show: boolean;
  type: 'theory' | 'practice';
  onClose: () => void;
  onImport: (parsedData: any) => Promise<{ success: boolean; message?: string }>;
}

export default function ImportJsonModal({
  show,
  type,
  onClose,
  onImport,
}: ImportJsonModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Reset states when shown
  useEffect(() => {
    if (show) {
      setJsonInput('');
      setImportError('');
      setImporting(false);
    }
  }, [show]);

  if (!show) return null;

  const handleFillTemplate = () => {
    if (type === 'theory') {
      const temp = [
        {
          title: 'Khai báo let và const',
          category: 'variables',
          tag: 'let / const',
          shortDesc: 'Sự khác biệt giữa biến thay đổi và hằng số.',
          longDesc: 'Dùng let để khai báo biến có thể thay đổi giá trị, dùng const cho hằng số...',
          code: 'let x = 10;\nx = 20;',
          useCase: 'Mặc định sử dụng const, chỉ dùng let khi chắc chắn giá trị sẽ thay đổi.',
        },
        {
          title: 'Hàm Mũi Tên (Arrow Function)',
          category: 'functions',
          tag: '=> syntax',
          shortDesc: 'Cú pháp khai báo hàm ngắn gọn và hiện đại.',
          longDesc: 'Arrow function cung cấp cú pháp viết hàm cực kỳ ngắn gọn và không tự tạo ngữ cảnh `this` riêng.',
          code: 'const add = (a, b) => a + b;',
          useCase: 'Thường dùng làm callback hoặc hàm xử lý mảng như map, filter.',
        },
      ];
      setJsonInput(JSON.stringify(temp, null, 2));
    } else {
      const temp = [
        {
          title: 'JavaScript Cơ Bản',
          language: 'javascript',
          description: 'Lộ trình học JavaScript nền tảng...',
          chapters: [
            {
              title: 'Chương 1: Biến & Kiểu dữ liệu',
              lessons: [
                {
                  title: 'Bài 1: Khai báo let',
                  exercises: [
                    {
                      type: 'multiple_choice',
                      question: 'Từ khóa nào dùng để khai báo biến có thể gán lại?',
                      options: ['let', 'const', 'var'],
                      correctAnswer: 'let',
                    },
                    {
                      type: 'code_input',
                      question: 'Điền dấu thích hợp để gán giá trị 10 cho x:\n\nlet x ___ 10;',
                      options: [],
                      correctAnswer: '=',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      setJsonInput(JSON.stringify(temp, null, 2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    const trimmedInput = jsonInput.trim();
    if (!trimmedInput) {
      setImportError('Vui lòng nhập chuỗi JSON!');
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(trimmedInput);
    } catch (err: any) {
      // Auto-wrap fallback if user forgot outer array brackets for multiple objects
      if (!trimmedInput.startsWith('[')) {
        try {
          parsedData = JSON.parse(`[${trimmedInput}]`);
        } catch (innerErr) {
          setImportError(`JSON không hợp lệ: ${err.message}`);
          return;
        }
      } else {
        setImportError(`JSON không hợp lệ: ${err.message}`);
        return;
      }
    }

    setImporting(true);
    try {
      const result = await onImport(parsedData);
      if (result.success) {
        onClose();
      } else {
        setImportError(result.message || 'Lỗi xảy ra trong quá trình import.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Lỗi không xác định khi thực hiện import.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-2xl w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
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
          Nhập Dữ Liệu {type === 'theory' ? 'Lý Thuyết' : 'Lộ Trình & Bài Tập'} từ JSON
        </h2>

        <div className="flex justify-between items-center bg-surface-container p-3 rounded-2xl border border-outline-variant/20">
          <span className="text-[10px] text-on-surface-variant font-black uppercase">
            Mẫu JSON có sẵn
          </span>
          <button
            type="button"
            onClick={handleFillTemplate}
            className="bg-surface hover:bg-surface-bright border border-black/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all"
          >
            Điền mẫu dữ liệu
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-on-surface-variant uppercase font-black">
            Nội dung JSON dữ liệu
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:border-secondary transition-colors font-mono text-xs leading-relaxed custom-scrollbar"
            placeholder="Dán mã JSON tại đây... (Chấp nhận cả đối tượng đơn lẻ hoặc mảng các đối tượng)"
            required
          />
        </div>

        {importError && (
          <p className="text-brand-red text-[11px] font-bold leading-normal">
            {importError}
          </p>
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
            disabled={importing}
            className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl border-b-4 border-secondary-dark active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
          >
            {importing ? 'ĐANG IMPORT...' : 'THỰC HIỆN IMPORT'}
          </button>
        </div>
      </form>
    </div>
  );
}
