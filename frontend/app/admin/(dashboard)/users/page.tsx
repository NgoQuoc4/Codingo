'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function UsersPage() {
  const { token, user } = useAuth();

  // State
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // User modal editor state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userXpInput, setUserXpInput] = useState<number>(0);
  const [userHeartsInput, setUserHeartsInput] = useState<number>(5);
  const [userStreakInput, setUserStreakInput] = useState<number>(0);
  const [userRoleInput, setUserRoleInput] = useState<string>('user');

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        triggerAlert('Lỗi tải danh sách học viên', 'error');
      }
    } catch (err) {
      triggerAlert('Lỗi tải danh sách học viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
        triggerAlert('Cập nhật học viên thành công!');
        setShowUserModal(false);
        fetchUsers();
      } else {
        triggerAlert('Cập nhật học viên thất bại', 'error');
      }
    } catch (err) {
      triggerAlert('Lỗi kết nối khi lưu thông tin', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      triggerAlert('Bạn không thể tự xóa chính mình!', 'error');
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Xóa vĩnh viễn học viên',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn học viên này? Thao tác không thể khôi phục.',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            triggerAlert('Xóa tài khoản thành công!');
            fetchUsers();
          } else {
            const data = await res.json();
            triggerAlert(data.message || 'Xóa tài khoản thất bại', 'error');
          }
        } catch (err) {
          triggerAlert('Lỗi kết nối khi xóa học viên', 'error');
        }
      },
    });
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

      <h3 className="font-button text-sm font-black text-on-surface uppercase tracking-wider">
        Quản lý học viên
      </h3>

      {loading ? (
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
                        usr.role === 'admin'
                          ? 'bg-secondary/15 text-secondary border border-secondary/25'
                          : 'bg-surface border border-outline-variant/35 text-on-surface-variant'
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
                      disabled={usr.id === user?.id}
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
                Username:{' '}
                <span className="text-on-surface font-extrabold">
                  {editingUser.username}
                </span>
              </p>
              <p>
                Email:{' '}
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
