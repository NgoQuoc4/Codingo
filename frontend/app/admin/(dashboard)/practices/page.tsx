'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import ImportJsonModal from '../../../../components/admin/ImportJsonModal';

interface PracticePath {
  id: string;
  title: string;
  language: string;
  description: string;
  chapters: any[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper to generate a 24-character hexadecimal ObjectId
const generateObjectId = (): string => {
  const hexChars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
  }
  return result;
};

export default function PracticesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [practicesList, setPracticesList] = useState<PracticePath[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal creation states
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceLang, setPracticeLang] = useState('javascript');
  const [practiceDesc, setPracticeDesc] = useState('');

  // Import JSON Modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Confirmation dialog
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

  // Lấy danh sách lộ trình bài tập từ API (sử dụng HttpOnly cookie tự động)
  const fetchPractices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/practices`);
      if (res.ok) {
        const data = await res.json();
        setPracticesList(data);
      } else {
        triggerAlert('Lỗi tải danh sách lộ trình', 'error');
      }
    } catch (err) {
      triggerAlert('Lỗi tải danh sách lộ trình', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API tải lộ trình khi component mount
  useEffect(() => {
    fetchPractices();
  }, []);

  const handleCreatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTitle || !practiceLang) {
      triggerAlert('Vui lòng nhập tên và ngôn ngữ', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/practices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: practiceTitle,
          language: practiceLang,
          description: practiceDesc,
        }),
      });

      if (res.ok) {
        triggerAlert('Tạo lộ trình thực hành mới thành công!');
        setPracticeTitle('');
        setPracticeDesc('');
        setShowPracticeModal(false);
        fetchPractices();
      } else {
        triggerAlert('Tạo lộ trình thất bại', 'error');
      }
    } catch (err) {
      triggerAlert('Lỗi kết nối tạo lộ trình', 'error');
    }
  };

  const handleDeletePractice = async (id: string) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa lộ trình thực hành',
      message: 'Bạn có chắc chắn muốn xóa lộ trình thực hành này? Toàn bộ chương và bài học sẽ bị xóa vĩnh viễn.',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/admin/practices/${id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            triggerAlert('Đã xóa lộ trình thành công!');
            fetchPractices();
          } else {
            triggerAlert('Xóa lộ trình thất bại', 'error');
          }
        } catch (err) {
          triggerAlert('Lỗi kết nối khi xóa lộ trình', 'error');
        }
      },
    });
  };

  const handleImportPractice = async (parsedData: any) => {
    const items = Array.isArray(parsedData) ? parsedData : [parsedData];
    if (items.length === 0) {
      return { success: false, message: 'Dữ liệu JSON rỗng, không có lộ trình nào để import!' };
    }

    for (const item of items) {
      if (!item.title || !item.language) {
        return {
          success: false,
          message: 'Dữ liệu lộ trình bị thiếu trường bắt buộc (title, language).',
        };
      }
    }

    let successCount = 0;
    for (const item of items) {
      const res = await fetch(`${API_URL}/admin/practices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: item.title,
          language: item.language,
          description: item.description || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const practiceId = data.practice?.id || data.practice?._id;

        if (
          practiceId &&
          item.chapters &&
          Array.isArray(item.chapters) &&
          item.chapters.length > 0
        ) {
          const formattedChapters = item.chapters.map((ch: any) => ({
            id: ch.id || ch._id || generateObjectId(),
            title: ch.title || 'Chương không có tên',
            lessons: (ch.lessons || []).map((l: any) => ({
              id: l.id || l._id || generateObjectId(),
              title: l.title || 'Bài học không có tên',
              exercises: (l.exercises || []).map((ex: any) => ({
                type: ex.type || 'multiple_choice',
                question: ex.question || '',
                options: ex.options || [],
                correctAnswer: ex.correctAnswer !== undefined ? ex.correctAnswer : '',
              })),
            })),
          }));

          await fetch(`${API_URL}/admin/practices/${practiceId}/chapters`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chapters: formattedChapters }),
          });
        }
        successCount++;
      }
    }

    triggerAlert(`Đã import thành công ${successCount}/${items.length} lộ trình thực hành!`);
    fetchPractices();
    return { success: true };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alert banner */}
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

      <div className="flex justify-between items-center max-w-4xl">
        <h3 className="font-button text-sm font-black text-on-surface uppercase tracking-wider">
          Lộ trình bài tập hiện tại
        </h3>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-surface-container hover:bg-surface-bright border-b-4 border-black/20 text-on-surface font-button px-4 py-2.5 rounded-2xl flex items-center gap-2 active:translate-y-[2px] active:border-b-2 transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-sm font-black">
              upload_file
            </span>
            <span>IMPORT JSON</span>
          </button>
          <button
            onClick={() => setShowPracticeModal(true)}
            className="bg-primary text-on-primary font-button px-5 py-2.5 rounded-2xl border-b-4 border-primary-dark flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-sm font-black">
              add_circle
            </span>
            <span>TẠO LỘ TRÌNH</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
            refresh
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-w-4xl">
          {practicesList.map((pr) => (
            <div
              key={pr.id}
              className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex justify-between items-center gap-4 hover:bg-surface-bright transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-on-surface">
                    {pr.title}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-primary-container text-on-primary-container">
                    {pr.language}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium line-clamp-1 max-w-md">
                  {pr.description || 'Không có mô tả.'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-on-surface-variant">
                  {pr.chapters?.length || 0} Chương
                </span>
                <button
                  onClick={() => router.push(`/admin/practices/${pr.id}`)}
                  className="bg-surface-dim hover:bg-surface-bright border-b-2 border-black/20 text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:translate-y-[1px] font-bold text-xs"
                  title="Quản lý nội dung"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    edit_note
                  </span>
                  Nội dung
                </button>
                <button
                  onClick={() => handleDeletePractice(pr.id)}
                  className="bg-surface-dim hover:bg-surface-bright border-b-2 border-black/20 text-on-surface-variant hover:text-brand-red w-9 h-9 rounded-xl flex items-center justify-center transition-all active:translate-y-[1px]"
                  title="Xóa lộ trình"
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE PRACTICE PATHWAY */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleCreatePractice}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-sm w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPracticeModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg font-black uppercase text-on-surface mb-2 mt-2">
              Tạo Lộ Trình
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Tên Lộ trình
              </label>
              <input
                type="text"
                value={practiceTitle}
                onChange={(e) => setPracticeTitle(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                placeholder="Ví dụ: HTML/CSS Căn Bản"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Ngôn ngữ Lập trình
              </label>
              <input
                type="text"
                value={practiceLang}
                onChange={(e) => setPracticeLang(e.target.value.toLowerCase())}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                placeholder="Ví dụ: html, css, csharp"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Mô tả lộ trình
              </label>
              <textarea
                value={practiceDesc}
                onChange={(e) => setPracticeDesc(e.target.value)}
                rows={3}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors custom-scrollbar font-sans"
                placeholder="Ví dụ: Tìm hiểu cấu trúc thẻ HTML và cách viết CSS định kiểu..."
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowPracticeModal(false)}
                className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-2.5 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl border-b-4 border-secondary-dark active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                TẠO MỚI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reusable Import JSON modal */}
      <ImportJsonModal
        show={showImportModal}
        type="practice"
        onClose={() => setShowImportModal(false)}
        onImport={handleImportPractice}
      />

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        show={!!confirmDialog}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}
