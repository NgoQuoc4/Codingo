"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Navbar";

interface TheoryLesson {
  id: string;
  title: string;
  category: "variables" | "functions" | "logic";
  tag: string;
  shortDesc: string;
  longDesc: string;
  code: string;
  useCase: string;
}

interface AdminStats {
  totalUsers: number;
  totalPractices: number;
  totalCourses: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  xp: number;
  hearts: number;
  streak: number;
  role: string;
  createdAt: string;
}

interface PracticePath {
  id: string;
  title: string;
  language: string;
  description: string;
  chapters: any[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function AdminPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation and layout states
  const [activeTab, setActiveTab] = useState<
    "stats" | "theory" | "users" | "practices"
  >("stats");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Theory CRUD states
  const [theoryLessons, setTheoryLessons] = useState<TheoryLesson[]>([]);
  const [loadingTheory, setLoadingTheory] = useState(false);
  const [selectedTheory, setSelectedTheory] = useState<TheoryLesson | null>(
    null,
  );
  const [showTheoryModal, setShowTheoryModal] = useState(false);

  // Theory form fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<
    "variables" | "functions" | "logic"
  >("variables");
  const [formTag, setFormTag] = useState("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formLongDesc, setFormLongDesc] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formUseCase, setFormUseCase] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [savingTheory, setSavingTheory] = useState(false);

  // Users Management states
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userXpInput, setUserXpInput] = useState<number>(0);
  const [userHeartsInput, setUserHeartsInput] = useState<number>(5);
  const [userStreakInput, setUserStreakInput] = useState<number>(0);
  const [userRoleInput, setUserRoleInput] = useState<string>("user");
  const [showUserModal, setShowUserModal] = useState(false);

  // Practices CRUD states
  const [practicesList, setPracticesList] = useState<PracticePath[]>([]);
  const [loadingPractices, setLoadingPractices] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceTitle, setPracticeTitle] = useState("");
  const [practiceLang, setPracticeLang] = useState("javascript");
  const [practiceDesc, setPracticeDesc] = useState("");

  // General notification alert banner
  const [alertMsg, setAlertMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Import JSON states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<"theory" | "practice">("theory");
  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  // Trigger floating feedback banner
  const triggerAlert = (
    text: string,
    type: "success" | "error" = "success",
  ) => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Route Guards: Redirect if not logged in or not admin
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "admin") {
      router.push("/learn");
    }
  }, [token, authLoading, user]);

  // Load active tab data
  useEffect(() => {
    if (authLoading || !token || (user && user.role !== "admin")) return;

    if (activeTab === "stats") {
      fetchStats();
    } else if (activeTab === "theory") {
      fetchTheoryLessons();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "practices") {
      fetchPractices();
    }
  }, [activeTab, token, authLoading, user]);

  // ================= FETCHING DATA ACTIONS =================

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      triggerAlert("Không thể tải thống kê", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTheoryLessons = async () => {
    try {
      setLoadingTheory(true);
      const res = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTheoryLessons(data);
      }
    } catch (err) {
      triggerAlert("Lỗi tải bài học lý thuyết", "error");
    } finally {
      setLoadingTheory(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      triggerAlert("Lỗi tải danh sách học viên", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPractices = async () => {
    try {
      setLoadingPractices(true);
      const res = await fetch(`${API_URL}/admin/practices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPracticesList(data);
      }
    } catch (err) {
      triggerAlert("Lỗi tải danh sách lộ trình", "error");
    } finally {
      setLoadingPractices(false);
    }
  };

  // ================= THEORY HANDLER ACTIONS =================

  const openAddTheoryModal = () => {
    setIsEditMode(false);
    setSelectedTheory(null);
    setFormTitle("");
    setFormCategory("variables");
    setFormTag("");
    setFormShortDesc("");
    setFormLongDesc("");
    setFormCode("");
    setFormUseCase("");
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
      triggerAlert("Vui lòng nhập đầy đủ các trường!", "error");
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
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        triggerAlert(
          isEditMode
            ? "Cập nhật bài học thành công!"
            : "Tạo bài học lý thuyết mới thành công!",
        );
        setShowTheoryModal(false);
        fetchTheoryLessons();
      } else {
        const errorData = await res.json();
        triggerAlert(errorData.message || "Lưu thất bại", "error");
      }
    } catch (err) {
      triggerAlert("Lỗi kết nối khi lưu bài học", "error");
    } finally {
      setSavingTheory(false);
    }
  };

  const handleDeleteTheory = async (id: string) => {
    setConfirmDialog({
      show: true,
      title: "Xóa bài học lý thuyết",
      message:
        "Bạn có chắc chắn muốn xóa bài học lý thuyết này? Thao tác không thể hoàn tác.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/admin/courses/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            triggerAlert("Đã xóa bài học thành công!");
            fetchTheoryLessons();
          } else {
            triggerAlert("Xóa bài học thất bại", "error");
          }
        } catch (err) {
          triggerAlert("Lỗi kết nối khi xóa", "error");
        }
      },
    });
  };

  // ================= USERS HANDLER ACTIONS =================

  const openEditUserModal = (userItem: AdminUser) => {
    setEditingUser(userItem);
    setUserXpInput(userItem.xp);
    setUserHeartsInput(userItem.hearts);
    setUserStreakInput(userItem.streak);
    setUserRoleInput(userItem.role);
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          xp: userXpInput,
          hearts: userHeartsInput,
          streak: userStreakInput,
          role: userRoleInput,
        }),
      });

      if (res.ok) {
        triggerAlert("Cập nhật học viên thành công!");
        setShowUserModal(false);
        fetchUsers();
      } else {
        triggerAlert("Cập nhật học viên thất bại", "error");
      }
    } catch (err) {
      triggerAlert("Lỗi kết nối khi lưu thông tin", "error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      triggerAlert("Bạn không thể tự xóa chính mình!", "error");
      return;
    }
    setConfirmDialog({
      show: true,
      title: "Xóa vĩnh viễn học viên",
      message:
        "Bạn có chắc chắn muốn xóa vĩnh viễn học viên này? Thao tác không thể khôi phục.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            triggerAlert("Xóa tài khoản thành công!");
            fetchUsers();
          } else {
            const data = await res.json();
            triggerAlert(data.message || "Xóa tài khoản thất bại", "error");
          }
        } catch (err) {
          triggerAlert("Lỗi kết nối khi xóa học viên", "error");
        }
      },
    });
  };

  // ================= PRACTICES HANDLER ACTIONS =================

  const handleCreatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTitle || !practiceLang) {
      triggerAlert("Vui lòng nhập tên và ngôn ngữ", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/practices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: practiceTitle,
          language: practiceLang,
          description: practiceDesc,
        }),
      });

      if (res.ok) {
        triggerAlert("Tạo lộ trình thực hành mới thành công!");
        setPracticeTitle("");
        setPracticeDesc("");
        setShowPracticeModal(false);
        fetchPractices();
      } else {
        triggerAlert("Tạo lộ trình thất bại", "error");
      }
    } catch (err) {
      triggerAlert("Lỗi kết nối tạo lộ trình", "error");
    }
  };

  const handleDeletePractice = async (id: string) => {
    setConfirmDialog({
      show: true,
      title: "Xóa lộ trình thực hành",
      message:
        "Bạn có chắc chắn muốn xóa lộ trình thực hành này? Toàn bộ chương và bài học sẽ bị xóa vĩnh viễn.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/admin/practices/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            triggerAlert("Đã xóa lộ trình thành công!");
            fetchPractices();
          } else {
            triggerAlert("Xóa lộ trình thất bại", "error");
          }
        } catch (err) {
          triggerAlert("Lỗi kết nối khi xóa lộ trình", "error");
        }
      },
    });
  };

  // Helper to generate a random 24-character hexadecimal ObjectId
  const generateObjectId = (): string => {
    const hexChars = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 24; i++) {
      result += hexChars[Math.floor(Math.random() * 16)];
    }
    return result;
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    const trimmedInput = jsonInput.trim();
    if (!trimmedInput) {
      setImportError("Vui lòng nhập chuỗi JSON!");
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(trimmedInput);
    } catch (err: any) {
      // Auto-wrap fallback if user forgot outer array brackets for multiple objects
      if (!trimmedInput.startsWith("[")) {
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
      if (importType === "theory") {
        const items = Array.isArray(parsedData) ? parsedData : [parsedData];
        if (items.length === 0) {
          throw new Error("Dữ liệu JSON rỗng, không có bài học nào để import!");
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
            throw new Error(
              "Dữ liệu lý thuyết bị thiếu trường bắt buộc (title, category, tag, shortDesc, longDesc, code, useCase).",
            );
          }
        }

        let successCount = 0;
        for (const item of items) {
          const res = await fetch(`${API_URL}/admin/courses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          });
          if (res.ok) {
            successCount++;
          }
        }

        triggerAlert(
          `Đã import thành công ${successCount}/${items.length} bài học lý thuyết!`,
        );
        fetchTheoryLessons();
        setShowImportModal(false);
        setJsonInput("");
      } else if (importType === "practice") {
        const items = Array.isArray(parsedData) ? parsedData : [parsedData];
        if (items.length === 0) {
          throw new Error(
            "Dữ liệu JSON rỗng, không có lộ trình nào để import!",
          );
        }

        for (const item of items) {
          if (!item.title || !item.language) {
            throw new Error(
              "Dữ liệu lộ trình bị thiếu trường bắt buộc (title, language).",
            );
          }
        }

        let successCount = 0;
        for (const item of items) {
          const res = await fetch(`${API_URL}/admin/practices`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: item.title,
              language: item.language,
              description: item.description || "",
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
                title: ch.title || "Chương không có tên",
                lessons: (ch.lessons || []).map((l: any) => ({
                  id: l.id || l._id || generateObjectId(),
                  title: l.title || "Bài học không có tên",
                  exercises: (l.exercises || []).map((ex: any) => ({
                    type: ex.type || "multiple_choice",
                    question: ex.question || "",
                    options: ex.options || [],
                    correctAnswer:
                      ex.correctAnswer !== undefined ? ex.correctAnswer : "",
                  })),
                })),
              }));

              await fetch(`${API_URL}/admin/practices/${practiceId}/chapters`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chapters: formattedChapters }),
              });
            }
            successCount++;
          }
        }

        triggerAlert(
          `Đã import thành công ${successCount}/${items.length} lộ trình thực hành!`,
        );
        fetchPractices();
        setShowImportModal(false);
        setJsonInput("");
      }
    } catch (err: any) {
      setImportError(err.message || "Lỗi kết nối khi import dữ liệu");
    } finally {
      setImporting(false);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">
          refresh
        </span>
        <p className="font-extrabold text-on-surface-variant/80">
          Kiểm tra quyền hạn quản trị...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative select-none">
      <Sidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col h-screen overflow-hidden">
        {/* Floating System-Wide Alerts */}
        {alertMsg && (
          <div
            className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 border-2 border-b-6 transition-all duration-300 backdrop-blur-md transform translate-y-0 scale-100 ${
              alertMsg.type === "success"
                ? "bg-[#111e15]/95 border-emerald-500/30 border-b-emerald-500 text-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.15)]"
                : "bg-[#211212]/95 border-red-500/30 border-b-red-500 text-red-400 shadow-[0_8px_30px_rgba(239,68,68,0.15)]"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {alertMsg.type === "success" ? "check_circle" : "cancel"}
            </span>
            <span className="font-black text-[11px] uppercase tracking-widest leading-none">
              {alertMsg.text}
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 relative">
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-headline-lg text-2xl md:text-3xl font-black text-on-surface flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-secondary text-3xl">
                  admin_panel_settings
                </span>
                BẢNG QUẢN TRỊ
              </h1>
              <p className="font-body-md text-xs md:text-sm text-on-surface-variant/70 font-semibold uppercase tracking-wider">
                Quản lý học viên, khóa học lý thuyết & lộ trình bài tập.
              </p>
            </div>

            {/* Quick stats toggle shortcut */}
            <div className="text-xs font-bold text-on-surface-variant/40">
              Admin Session:{" "}
              <span className="text-secondary font-black">{user.username}</span>
            </div>
          </header>

          {/* Admin Navigation Tabs */}
          <div className="flex gap-2 border-b-4 border-surface-container pb-4 mb-8 overflow-x-auto">
            {[
              { id: "stats", name: "Tổng quan", icon: "dashboard" },
              { id: "users", name: "Học viên", icon: "group" },
              { id: "theory", name: "Lý thuyết", icon: "menu_book" },
              { id: "practices", name: "Lộ trình", icon: "map" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-b-4 font-bold text-xs uppercase transition-all active:translate-y-[2px] active:border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-secondary text-on-secondary border-secondary-dark"
                    : "bg-surface-container text-on-surface-variant border-black/20 hover:bg-surface-bright"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === "stats" && (
            <div className="space-y-8 animate-fadeIn">
              {loadingStats ? (
                <div className="flex justify-center py-12">
                  <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
                    refresh
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
                  {/* Stats Users Card */}
                  <div className="bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                    <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/25">
                      <span className="material-symbols-outlined text-3xl">
                        group
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">
                        TỔNG HỌC VIÊN
                      </p>
                      <p className="text-3xl font-black text-on-surface">
                        {stats?.totalUsers || 0}
                      </p>
                    </div>
                  </div>

                  {/* Stats Theory Card */}
                  <div className="bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                    <div className="w-14 h-14 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center border border-pink-500/25">
                      <span className="material-symbols-outlined text-3xl">
                        menu_book
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">
                        BÀI LÝ THUYẾT
                      </p>
                      <p className="text-3xl font-black text-on-surface">
                        {stats?.totalCourses || 0}
                      </p>
                    </div>
                  </div>

                  {/* Stats Practices Card */}
                  <div className="bg-surface-container p-6 rounded-3xl border-b-8 border-black/20 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                    <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/25">
                      <span className="material-symbols-outlined text-3xl">
                        map
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">
                        LỘ TRÌNH THỰC HÀNH
                      </p>
                      <p className="text-3xl font-black text-on-surface">
                        {stats?.totalPractices || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THEORY MANAGEMENT */}
          {activeTab === "theory" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center max-w-4xl">
                <h3 className="font-button text-sm font-black text-on-surface uppercase tracking-wider">
                  Danh sách bài học lý thuyết
                </h3>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setImportType("theory");
                      setJsonInput("");
                      setImportError("");
                      setShowImportModal(true);
                    }}
                    className="bg-surface-container hover:bg-surface-bright border-b-4 border-black/20 text-on-surface font-button px-4 py-2.5 rounded-2xl flex items-center gap-2 active:translate-y-[2px] active:border-b-2 transition-all text-xs"
                  >
                    <span className="material-symbols-outlined text-sm font-black">
                      upload_file
                    </span>
                    <span>IMPORT JSON</span>
                  </button>
                  <button
                    onClick={openAddTheoryModal}
                    className="bg-primary text-on-primary font-button px-5 py-2.5 rounded-2xl border-b-4 border-primary-dark flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs"
                  >
                    <span className="material-symbols-outlined text-sm font-black">
                      add_circle
                    </span>
                    <span>THÊM BÀI HỌC</span>
                  </button>
                </div>
              </div>

              {loadingTheory ? (
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
                                lesson.category === "variables"
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                  : lesson.category === "functions"
                                    ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {lesson.category === "variables"
                                ? "Biến & Kiểu dữ liệu"
                                : lesson.category === "functions"
                                  ? "Hàm & Phương thức"
                                  : "Logic & Cú pháp"}
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
            </div>
          )}

          {/* TAB 3: USERS LIST */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-button text-sm font-black text-on-surface uppercase tracking-wider">
                Quản lý học viên
              </h3>

              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
                    refresh
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border-2 border-outline-variant/30 max-w-5xl bg-surface-container shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface border-b-4 border-black/10 text-on-surface-variant text-[10px] font-black uppercase tracking-wider">
                        <th className="p-4">TÊN</th>
                        <th className="p-4">EMAIL</th>
                        <th className="p-4">KINH NGHIỆM</th>
                        <th className="p-4">TRÁI TIM</th>
                        <th className="p-4">STREAK</th>
                        <th className="p-4">VAI TRÒ</th>
                        <th className="p-4 text-center">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 font-bold text-xs text-on-surface">
                      {usersList.map((usr) => (
                        <tr
                          key={usr.id}
                          className="hover:bg-surface-bright/50 transition-colors"
                        >
                          <td className="p-4 font-black">{usr.username}</td>
                          <td className="p-4 font-semibold text-on-surface-variant/80">
                            {usr.email}
                          </td>
                          <td className="p-4 text-brand-orange">{usr.xp} XP</td>
                          <td className="p-4 text-brand-red">{usr.hearts}/5</td>
                          <td className="p-4 text-brand-yellow">
                            {usr.streak} ngày
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                usr.role === "admin"
                                  ? "bg-secondary/15 text-secondary border border-secondary/25"
                                  : "bg-surface border border-outline-variant/35 text-on-surface-variant"
                              }`}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4 flex justify-center gap-2">
                            <button
                              onClick={() => openEditUserModal(usr)}
                              className="bg-surface-dim hover:bg-surface-bright border-b-2 border-black/20 text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:translate-y-[1px]"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                tune
                              </span>
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              disabled={usr.id === user.id}
                              className="bg-surface-dim hover:bg-surface-bright disabled:opacity-30 disabled:pointer-events-none border-b-2 border-black/20 text-on-surface-variant hover:text-brand-red px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:translate-y-[1px]"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                delete
                              </span>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRACTICES PATHWAYS */}
          {activeTab === "practices" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center max-w-4xl">
                <h3 className="font-button text-sm font-black text-on-surface uppercase tracking-wider">
                  Lộ trình bài tập hiện tại
                </h3>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setImportType("practice");
                      setJsonInput("");
                      setImportError("");
                      setShowImportModal(true);
                    }}
                    className="bg-surface-container hover:bg-surface-bright border-b-4 border-black/20 text-on-surface font-button px-4 py-2.5 rounded-2xl flex items-center gap-2 active:translate-y-[2px] active:border-b-2 transition-all text-xs"
                  >
                    <span className="material-symbols-outlined text-sm font-black">
                      upload_file
                    </span>
                    <span>IMPORT JSON</span>
                  </button>
                  <button
                    onClick={() => setShowPracticeModal(true)}
                    className="bg-primary text-on-primary font-button px-5 py-2.5 rounded-2xl border-b-4 border-primary-dark flex items-center gap-2 hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all text-xs"
                  >
                    <span className="material-symbols-outlined text-sm font-black">
                      add_circle
                    </span>
                    <span>TẠO LỘ TRÌNH</span>
                  </button>
                </div>
              </div>

              {loadingPractices ? (
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
                      className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex justify-between items-center gap-4"
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
                          {pr.description || "Không có mô tả."}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-on-surface-variant">
                          {pr.chapters?.length || 0} Chương
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/admin/practices/${pr.id}`)
                          }
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
            </div>
          )}

          {/* Floating Atmospheric Details */}
          <div className="absolute inset-0 pointer-events-none z-[-1] opacity-20 overflow-hidden">
            <div className="absolute top-20 -left-20 w-80 h-80 bg-secondary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-primary/10 blur-[140px] rounded-full"></div>
          </div>
        </main>
      </div>

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
              {isEditMode
                ? "Cập nhật bài học lý thuyết"
                : "Tạo bài học lý thuyết mới"}
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
                {savingTheory ? "ĐANG LƯU..." : "LƯU BÀI HỌC"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: USER ADJUST STATS */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleSaveUser}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-sm w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg font-black uppercase text-on-surface mb-2 mt-2">
              Điều chỉnh Học viên
            </h2>

            <div className="text-xs text-on-surface-variant/75 font-semibold space-y-1 mb-2 border-b border-outline-variant/20 pb-3">
              <p>
                Username:{" "}
                <span className="text-on-surface font-extrabold">
                  {editingUser.username}
                </span>
              </p>
              <p>
                Email:{" "}
                <span className="text-on-surface font-extrabold">
                  {editingUser.email}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Điểm Kinh Nghiệm (XP)
              </label>
              <input
                type="number"
                value={userXpInput}
                onChange={(e) => setUserXpInput(parseInt(e.target.value) || 0)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Số trái tim (Tối đa 5)
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={userHeartsInput}
                onChange={(e) =>
                  setUserHeartsInput(parseInt(e.target.value) || 0)
                }
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Độ dài chuỗi Streak (Ngày)
              </label>
              <input
                type="number"
                value={userStreakInput}
                onChange={(e) =>
                  setUserStreakInput(parseInt(e.target.value) || 0)
                }
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase font-black">
                Vai trò hệ thống
              </label>
              <select
                value={userRoleInput}
                onChange={(e) => setUserRoleInput(e.target.value)}
                className="bg-surface border-2 border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="user">User (Học viên thường)</option>
                <option value="admin">Admin (Quản trị viên)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
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

      {/* MODAL: IMPORT JSON DATA */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleImportJson}
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-2xl w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim hover:bg-surface-bright border-2 border-black/10 active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="font-headline-lg text-lg font-black uppercase text-on-surface mb-2 mt-2">
              Nhập Dữ Liệu{" "}
              {importType === "theory" ? "Lý Thuyết" : "Lộ Trình & Bài Tập"} từ
              JSON
            </h2>

            <div className="flex justify-between items-center bg-surface-container p-3 rounded-2xl border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant font-black uppercase">
                Mẫu JSON có sẵn
              </span>
              <div className="flex gap-2">
                {importType === "theory" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const temp = [
                        {
                          title: "Khai báo let và const",
                          category: "variables",
                          tag: "let / const",
                          shortDesc:
                            "Sự khác biệt giữa biến thay đổi và hằng số.",
                          longDesc:
                            "Dùng let để khai báo biến có thể thay đổi giá trị, dùng const cho hằng số...",
                          code: "let x = 10;\nx = 20;",
                          useCase:
                            "Mặc định sử dụng const, chỉ dùng let khi chắc chắn giá trị sẽ thay đổi.",
                        },
                        {
                          title: "Hàm Mũi Tên (Arrow Function)",
                          category: "functions",
                          tag: "=> syntax",
                          shortDesc:
                            "Cú pháp khai báo hàm ngắn gọn và hiện đại.",
                          longDesc:
                            "Arrow function cung cấp cú pháp viết hàm cực kỳ ngắn gọn và không tự tạo ngữ cảnh `this` riêng.",
                          code: "const add = (a, b) => a + b;",
                          useCase:
                            "Thường dùng làm callback hoặc hàm xử lý mảng như map, filter.",
                        },
                      ];
                      setJsonInput(JSON.stringify(temp, null, 2));
                    }}
                    className="bg-surface hover:bg-surface-bright border border-black/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all"
                  >
                    Điền Mẫu Lý Thuyết
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const temp = [
                        {
                          title: "JavaScript Cơ Bản",
                          language: "javascript",
                          description: "Lộ trình học JavaScript nền tảng...",
                          chapters: [
                            {
                              title: "Chương 1: Biến & Kiểu dữ liệu",
                              lessons: [
                                {
                                  title: "Bài 1: Khai báo let",
                                  exercises: [
                                    {
                                      type: "multiple_choice",
                                      question:
                                        "Từ khóa nào dùng để khai báo biến có thể gán lại?",
                                      options: ["let", "const", "var"],
                                      correctAnswer: "let",
                                    },
                                    {
                                      type: "code_input",
                                      question:
                                        "Điền dấu thích hợp để gán giá trị 10 cho x:\n\nlet x ___ 10;",
                                      options: [],
                                      correctAnswer: "=",
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ];
                      setJsonInput(JSON.stringify(temp, null, 2));
                    }}
                    className="bg-surface hover:bg-surface-bright border border-black/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all"
                  >
                    Điền Mẫu Lộ Trình
                  </button>
                )}
              </div>
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
                onClick={() => setShowImportModal(false)}
                className="bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-2.5 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                disabled={importing}
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl border-b-4 border-secondary-dark active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px]"
              >
                {importing ? "ĐANG IMPORT..." : "THỰC HIỆN IMPORT"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* MODAL: CUSTOM 3D CONFIRMATION DIALOG */}
      {confirmDialog && confirmDialog.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div
            className="bg-surface-container-high border-4 border-black/30 rounded-3xl max-w-sm w-full p-6 relative shadow-[0_16px_0_0_rgba(0,0,0,0.3)] flex flex-col gap-4 text-xs font-bold text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-500/10 text-brand-red rounded-full flex items-center justify-center mx-auto border-2 border-brand-red/30 shadow-inner">
              <span className="material-symbols-outlined text-3xl">
                warning
              </span>
            </div>

            <div className="text-center space-y-1.5">
              <h2 className="font-headline-lg text-base font-black uppercase text-on-surface">
                {confirmDialog.title}
              </h2>
              <p className="text-on-surface-variant font-semibold text-xs leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex gap-2.5 border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-surface-dim hover:bg-surface-bright text-on-surface-variant px-5 py-3 rounded-xl border-b-4 border-black/10 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px] text-center"
              >
                HỦY BỎ
              </button>
              <button
                type="button"
                onClick={() => confirmDialog.onConfirm()}
                className="flex-1 bg-brand-red hover:bg-red-500 text-white px-5 py-3 rounded-xl border-b-4 border-red-800 active:translate-y-[1px] active:border-b-2 uppercase font-black tracking-wider text-[10px] text-center"
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
