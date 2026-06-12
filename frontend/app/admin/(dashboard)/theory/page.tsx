'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import ImportJsonModal from '../../../../components/admin/ImportJsonModal';

interface TheoryLesson {
  id: string;
  title: string;
  category: 'variables' | 'functions' | 'logic';
  tag: string;
  shortDesc: string;
  longDesc: string;
  code: string;
  useCase: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function TheoryPage() {
  const { token } = useAuth();

  // State
  const [theoryLessons, setTheoryLessons] = useState<TheoryLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AI generation states
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<'variables' | 'functions' | 'logic'>('variables');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [generating, setGenerating] = useState(false);

  // Modal editor state
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [selectedTheory, setSelectedTheory] = useState<TheoryLesson | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'variables' | 'functions' | 'logic'>('variables');
  const [formTag, setFormTag] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formLongDesc, setFormLongDesc] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formUseCase, setFormUseCase] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [savingTheory, setSavingTheory] = useState(false);

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

  const fetchTheoryLessons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTheoryLessons(data);
      } else {
        triggerAlert('Lỗi tải bài học lý thuyết', 'error');
      }
    } catch (err) {
      triggerAlert('Lỗi tải bài học lý thuyết', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTheoryLessons();
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key');
      if (savedKey) {
        setGeminiApiKey(savedKey);
      }
    }
  }, []);

  const handleGenerateAiTheory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;

    if (!aiTopic.trim()) {
      triggerAlert('Vui lòng nhập chủ đề lý thuyết!', 'error');
      return;
    }
    if (!geminiApiKey.trim()) {
      triggerAlert('Vui lòng nhập Gemini API Key!', 'error');
      return;
    }

    setGenerating(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim());
    }

    // Prepare list of existing theories to prevent duplication
    const existingListText = theoryLessons
      .map((lesson, idx) => `${idx + 1}. Tiêu đề: "${lesson.title}", Thẻ: "${lesson.tag}", Mô tả ngắn: "${lesson.shortDesc}"`)
      .join('\n');

    const promptText = `Bạn là một chuyên gia giảng dạy lập trình của ứng dụng FocusRPG (học lập trình qua game). 
Nhiệm vụ của bạn là soạn thảo một bài học lý thuyết lập trình thật CHI TIẾT và dễ hiểu cho người mới bắt đầu về chủ đề: "${aiTopic}" thuộc danh mục "${aiCategory}".

Để tránh trùng lặp nội dung với các bài lý thuyết đã có, đây là danh sách các bài học hiện tại trong hệ thống:
${existingListText || '(Chưa có bài học nào)'}

Hãy tạo một bài lý thuyết hoàn toàn mới, không trùng lặp tiêu đề hay nội dung cốt lõi của các bài trên. Bài viết cần cực kỳ chi tiết, diễn giải dễ hiểu, có ví dụ thực tế và trường hợp sử dụng rõ ràng.

Định dạng trả về PHẢI là một đối tượng JSON duy nhất có các trường sau:
{
  "title": "Tiêu đề bài học ngắn gọn, thu hút (tiếng Việt)",
  "tag": "Thẻ nhãn kỹ thuật chính (ví dụ: let/const, map, if-else, try-catch)",
  "shortDesc": "Mô tả ngắn gọn hiển thị trên card (tiếng Việt, dưới 120 ký tự)",
  "longDesc": "Nội dung lý thuyết cực kỳ CHI TIẾT, giải thích cặn kẽ khái niệm, cú pháp, cách hoạt động bằng tiếng Việt, chia thành các đoạn dễ đọc",
  "code": "Đoạn mã ví dụ thực tế và sạch đẹp minh họa cho kiến thức này (có chú thích giải thích trong code)",
  "useCase": "Trường hợp sử dụng thực tế nhất (ví dụ: Khi nào nên sử dụng, mẹo tối ưu... bằng tiếng Việt)"
}

Lưu ý quan trọng: Chỉ trả về chuỗi JSON thô, không bọc trong ký tự markdown \`\`\`json hay bất kỳ chữ nào khác ngoài đối tượng JSON.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorRes = await response.json().catch(() => ({}));
        throw new Error(errorRes.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('Không nhận được nội dung trả về từ Gemini API.');
      }

      const parsedData = JSON.parse(responseText.trim());

      // Auto-populate the main theory editor form
      setIsEditMode(false);
      setSelectedTheory(null);
      setFormTitle(parsedData.title || '');
      setFormCategory(aiCategory);
      setFormTag(parsedData.tag || '');
      setFormShortDesc(parsedData.shortDesc || '');
      setFormLongDesc(parsedData.longDesc || '');
      setFormCode(parsedData.code || '');
      setFormUseCase(parsedData.useCase || '');

      // Close AI Modal and open the Main Theory Form Modal
      setShowAiModal(false);
      setShowTheoryModal(true);
      triggerAlert('AI đã tạo bài học thành công! Vui lòng kiểm tra và lưu lại.');
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      triggerAlert(`Lỗi tạo bài học bằng AI: ${err.message || err}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const openAddTheoryModal = () => {
    setIsEditMode(false);
    setSelectedTheory(null);
    setFormTitle('');
    setFormCategory('variables');
    setFormTag('');
    setFormShortDesc('');
    setFormLongDesc('');
    setFormCode('');
    setFormUseCase('');
    setShowTheoryModal(true);
  };

  const openEditTheoryModal = (lesson: TheoryLesson) => {
    setIsEditMode(true);
    setSelectedTheory(lesson);
    setFormTitle(lesson.title);
    setFormCategory(lesson.category);
    setFormTag(lesson.tag);
    setFormShortDesc(lesson.shortDesc);
    setFormLongDesc(lesson.longDesc);
    setFormCode(lesson.code);
    setFormUseCase(lesson.useCase);
    setShowTheoryModal(true);
  };

  const handleSaveTheory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingTheory) return;

    if (
      !formTitle ||
      !formTag ||
      !formShortDesc ||
      !formLongDesc ||
      !formCode ||
      !formUseCase
    ) {
      triggerAlert('Vui lòng nhập đầy đủ các trường!', 'error');
      return;
    }

    setSavingTheory(true);
    const bodyData = {
      title: formTitle,
      category: formCategory,
      tag: formTag,
      shortDesc: formShortDesc,
      longDesc: formLongDesc,
      code: formCode,
      useCase: formUseCase,
    };

    try {
      const url =
        isEditMode && selectedTheory
          ? `${API_URL}/admin/courses/${selectedTheory.id}`
          : `${API_URL}/admin/courses`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        triggerAlert(
          isEditMode
            ? 'Cập nhật bài học thành công!'
            : 'Tạo bài học lý thuyết mới thành công!'
        );
        setShowTheoryModal(false);
        fetchTheoryLessons();
      } else {
        const errorData = await res.json();
        triggerAlert(errorData.message || 'Lưu thất bại', 'error');
      }
    } catch (err) {
      triggerAlert('Lỗi kết nối khi lưu bài học', 'error');
    } finally {
      setSavingTheory(false);
    }
  };

  const handleDeleteTheory = async (id: string) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa bài học lý thuyết',
      message: 'Bạn có chắc chắn muốn xóa bài học lý thuyết này? Thao tác không thể hoàn tác.',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/admin/courses/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            triggerAlert('Đã xóa bài học thành công!');
            fetchTheoryLessons();
          } else {
            triggerAlert('Xóa bài học thất bại', 'error');
          }
        } catch (err) {
          triggerAlert('Lỗi kết nối khi xóa', 'error');
        }
      },
    });
  };

  const handleImportTheory = async (parsedData: any) => {
    const items = Array.isArray(parsedData) ? parsedData : [parsedData];
    if (items.length === 0) {
      return { success: false, message: 'Dữ liệu JSON rỗng, không có bài học nào để import!' };
    }

    for (const item of items) {
      if (
        !item.title ||
        !item.category ||
        !item.tag ||
        !item.shortDesc ||
        !item.longDesc ||
        !item.code ||
        !item.useCase
      ) {
        return {
          success: false,
          message: 'Dữ liệu lý thuyết bị thiếu trường bắt buộc (title, category, tag, shortDesc, longDesc, code, useCase).',
        };
      }
    }

    let successCount = 0;
    for (const item of items) {
      const res = await fetch(`${API_URL}/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        successCount++;
      }
    }

    triggerAlert(`Đã import thành công ${successCount}/${items.length} bài học lý thuyết!`);
    fetchTheoryLessons();
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
          Danh sách bài học lý thuyết
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
            onClick={() => {
              setAiTopic('');
              setAiCategory('variables');
              setShowAiModal(true);
            }}
            className="bg-purple-600/90 text-white font-button px-4 py-2.5 rounded-2xl border-b-4 border-purple-800 flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs font-bold shadow-md"
          >
            <span className="material-symbols-outlined text-sm font-black animate-pulse">
              psychology
            </span>
            <span>TẠO BẰNG AI</span>
          </button>
          <button
            onClick={openAddTheoryModal}
            className="bg-primary text-on-primary font-button px-5 py-2.5 rounded-2xl border-b-4 border-primary-dark flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-sm font-black">
              add_circle
            </span>
            <span>THÊM BÀI HỌC</span>
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
          {theoryLessons.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic font-semibold">
              Chưa có bài học lý thuyết nào.
            </p>
          ) : (
            theoryLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-surface-bright transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-base text-on-surface">
                      {lesson.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg border ${
                        lesson.category === 'variables'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          : lesson.category === 'functions'
                            ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {lesson.category === 'variables'
                        ? 'Biến & Kiểu dữ liệu'
                        : lesson.category === 'functions'
                          ? 'Hàm & Phương thức'
                          : 'Logic & Cú pháp'}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-secondary/15 text-secondary border border-secondary/20">
                      {lesson.tag}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium line-clamp-2 max-w-xl">
                    {lesson.shortDesc}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditTheoryModal(lesson)}
                    className="bg-surface-dim hover:bg-surface-bright border-b-2 border-black/20 text-on-surface-variant hover:text-primary w-9 h-9 rounded-xl flex items-center justify-center transition-all active:translate-y-[1px]"
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-sm">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteTheory(lesson.id)}
                    className="bg-surface-dim hover:bg-surface-bright border-b-2 border-black/20 text-on-surface-variant hover:text-brand-red w-9 h-9 rounded-xl flex items-center justify-center transition-all active:translate-y-[1px]"
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: THEORY CREATE / UPDATE */}
      {showTheoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleSaveTheory}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-2xl w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] overflow-y-auto max-h-[90vh] custom-scrollbar flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowTheoryModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg md:text-xl font-black uppercase text-on-surface mb-2 mt-2">
              {isEditMode ? 'Cập nhật bài học lý thuyết' : 'Tạo bài học lý thuyết mới'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-on-surface-variant uppercase font-black">
                  Tiêu đề bài học
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                  placeholder="Khai báo let & const"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-on-surface-variant uppercase font-black">
                  Danh mục phân loại
                </label>
                <select
                  value={formCategory}
                  onChange={(e: any) => setFormCategory(e.target.value)}
                  className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  <option value="variables">Biến & Kiểu dữ liệu</option>
                  <option value="functions">Hàm & Phương thức</option>
                  <option value="logic">Logic & Cú pháp</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Thẻ nhãn (Tag / Badge)
              </label>
              <input
                type="text"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                placeholder="let / const"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Mô tả ngắn (Hiển thị trên Card)
              </label>
              <input
                type="text"
                value={formShortDesc}
                onChange={(e) => setFormShortDesc(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                placeholder="Sự khác biệt giữa biến có thể thay đổi và hằng số cố định."
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Mô tả chi tiết (Nội dung lý thuyết)
              </label>
              <textarea
                value={formLongDesc}
                onChange={(e) => setFormLongDesc(e.target.value)}
                rows={3}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors custom-scrollbar font-sans"
                placeholder="Nhập phần diễn giải chi tiết về cơ chế, kiến thức bài học..."
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Đoạn code ví dụ áp dụng
              </label>
              <textarea
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                rows={4}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors custom-scrollbar font-mono text-xs leading-relaxed"
                placeholder={`// let cho phép gán lại\nlet score = 10;\nscore = 15;`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Trường hợp sử dụng (Use case)
              </label>
              <input
                type="text"
                value={formUseCase}
                onChange={(e) => setFormUseCase(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                placeholder="Sử dụng const mặc định, dùng let khi chắc chắn biến thay đổi."
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowTheoryModal(false)}
                className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant font-button px-5 py-2.5 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                disabled={savingTheory}
                className="bg-secondary text-on-secondary font-button px-6 py-2.5 rounded-xl border-b-4 border-secondary-dark active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                {savingTheory ? 'ĐANG LƯU...' : 'LƯU BÀI HỌC'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AI GENERATION */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleGenerateAiTheory}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-md w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAiModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg md:text-xl font-black uppercase text-on-surface mb-2 mt-2">
              Tạo bài học bằng AI (Gemini)
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Chủ đề muốn tạo
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                placeholder="Ví dụ: Vòng lặp For...of, Xử lý lỗi với try-catch"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Danh mục bài học
              </label>
              <select
                value={aiCategory}
                onChange={(e: any) => setAiCategory(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="variables">Biến & Kiểu dữ liệu</option>
                <option value="functions">Hàm & Phương thức</option>
                <option value="logic">Logic & Cú pháp</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-on-surface-variant uppercase font-black">
                  Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-primary hover:underline font-bold"
                >
                  Lấy Key miễn phí
                </a>
              </div>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors"
                placeholder="Nhập khóa API Key từ AI Studio"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant font-button px-5 py-2.5 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                disabled={generating}
                className="bg-purple-600 text-white font-button px-6 py-2.5 rounded-xl border-b-4 border-purple-800 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                {generating ? 'ĐANG TẠO...' : 'TẠO LÝ THUYẾT'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reusable Import JSON modal */}
      <ImportJsonModal
        show={showImportModal}
        type="theory"
        onClose={() => setShowImportModal(false)}
        onImport={handleImportTheory}
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
