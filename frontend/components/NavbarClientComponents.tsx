"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export function SidebarLinks() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: "HỌC", path: "/learn", icon: "school" },
    { name: "LÝ THUYẾT", path: "/phonetics", icon: "menu_book" },
    { name: "BẢNG XẾP HẠNG", path: "/leaderboard", icon: "leaderboard" },
    { name: "NHIỆM VỤ", path: "/quests", icon: "task_alt" },
    { name: "CỬA HÀNG", path: "/shop", icon: "store" },
    { name: "HỒ SƠ", path: "/profile", icon: "person" },
    { name: "CÀI ĐẶT", path: "/settings", icon: "settings" },
  ];

  if (user.role === "admin") {
    menuItems.push({ name: "QUẢN TRỊ", path: "/admin", icon: "admin_panel_settings" });
  }

  return (
    <nav className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-4 rounded-xl p-3 border-b-4 transition-all duration-100 uppercase font-bold text-sm ${
              isActive
                ? "bg-secondary-container text-on-secondary-container border-on-secondary-fixed-variant translate-y-[2px]"
                : "text-on-surface-variant hover:bg-surface-bright hover:translate-y-[-2px] border-transparent active:scale-95"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline/30 bg-surface-bright">
          <img
            src={
              user.avatar ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAiIcZrqBjissZ0lmZIA-nyKbvY-D82bJ6mJ8J8rkNI357xJbE9pTlH96D2fG23jtsxJE-e-xpFn4FlMqvERx_Z3xMMIPdJqpy3HR0LV8W7sdE-uv-zKqRVVpJeHEn4EJQQdCjQE1hk4b-Jwgc7rhRgwtY71KRBbjDLnmXt6oDSWm2e-D1-yXq5MXgjUuJ6U1f9lR6QiXv_nTGYIAjippDKnm5DoMpcMX6jPFoiJt9h-XaP4HoI2y18Lm7WqEZ6cwJTNoD4Vu3LjqdO"
            }
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-on-surface truncate">
            {user.username}
          </span>
          <span className="text-[10px] text-on-surface-variant/60 font-medium truncate">
            {user.email}
          </span>
        </div>
      </div>
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-3 bg-surface-bright hover:bg-surface-variant hover:text-brand-red rounded-xl font-button text-xs border-b-4 border-black/30 transition-all active:translate-y-1 active:border-b-0 uppercase font-black"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
        <span>ĐĂNG XUẤT</span>
      </button>
    </div>
  );
}

export function MobileHeader() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="md:hidden flex justify-between items-center h-16 w-full fixed top-0 left-0 px-4 z-50 bg-surface-container-high border-b-4 border-black/20">
      <span className="font-headline-md text-xl font-black text-secondary tracking-tighter uppercase select-none">
        Codingo
      </span>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-sm font-black text-brand-red">
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span>{user.hearts}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-black text-brand-yellow">
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <span>{user.xp}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-black text-brand-orange">
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
          <span>{user.streak}</span>
        </span>
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: "HỌC", path: "/learn", icon: "school" },
    { name: "LÝ THUYẾT", path: "/phonetics", icon: "menu_book" },
    { name: "BẢNG XẾP HẠNG", path: "/leaderboard", icon: "leaderboard" },
    { name: "NHIỆM VỤ", path: "/quests", icon: "task_alt" },
    { name: "CỬA HÀNG", path: "/shop", icon: "store" },
    { name: "HỒ SƠ", path: "/profile", icon: "person" },
    { name: "CÀI ĐẶT", path: "/settings", icon: "settings" },
  ];

  if (user.role === "admin") {
    menuItems.push({ name: "QUẢN TRỊ", path: "/admin", icon: "admin_panel_settings" });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-high h-20 flex items-center justify-around px-2 z-50 border-t-4 border-black/10">
      {menuItems.slice(0, user.role === "admin" ? 8 : 6).map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all ${
              isActive
                ? "text-secondary font-black"
                : "text-on-surface-variant opacity-70"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className="text-[9px] font-black tracking-wider uppercase">
              {item.name === "BẢNG XẾP HẠNG"
                ? "BXH"
                : item.name === "CỬA HÀNG"
                  ? "C.HÀNG"
                  : item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
