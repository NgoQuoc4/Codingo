import React from "react";
import Link from "next/link";
import {
  SidebarLinks,
  SidebarProfile,
  MobileHeader,
  MobileBottomNav,
} from "./NavbarClientComponents";
import NotificationBell from "./NotificationBell";

/**
 * Navbar component là thanh điều hướng chính trong hệ thống Dashboard.
 * Kết hợp giữa:
 * - Sidebar bên trái ở màn hình Desktop (từ cỡ md trở lên).
 * - Header thống kê chỉ số ở trên và thanh Bottom Navigation ở dưới trên thiết bị Mobile.
 */
export default function Navbar() {
  return (

    <>
      {/* DESKTOP SIDEBAR (Visible on md and up) */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r-4 border-black/20 bg-surface-container flex flex-col p-6 gap-6 z-50 hidden md:flex">
        {/* Brand Logo Header */}
        <div className="flex flex-col gap-1 mb-8">
          <Link
            href="/learn"
            className="flex items-center gap-2 select-none group"
          >
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] transition-transform group-hover:scale-105 active:translate-y-0.5">
              <span
                className="material-symbols-outlined text-on-secondary text-2xl font-black"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
            <span className="font-display-lg text-2xl font-black text-secondary tracking-tighter uppercase">
              Codingo
            </span>
          </Link>
          <span className="text-xs font-bold text-on-surface-variant/60">
            Học lập trình game hóa
          </span>
        </div>

        {/* Navigation Tabs (Client Component for active tab checks) */}
        <SidebarLinks />

        {/* Notification Bell (Client Component) */}
        <NotificationBell variant="desktop" />

        {/* Footer profile & logout (Client Component) */}
        <SidebarProfile />
      </aside>

      {/* MOBILE HEADER (Client Component for stats) */}
      <MobileHeader />

      {/* MOBILE BOTTOM NAVIGATION (Client Component) */}
      <MobileBottomNav />
    </>
  );
}
