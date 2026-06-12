import React from 'react';
import AdminTabs from '../../../components/admin/AdminTabs';
import AdminSessionUser from '../../../components/admin/AdminSessionUser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
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

        {/* Client-side session information */}
        <AdminSessionUser />
      </header>

      {/* Admin Navigation Tabs */}
      <AdminTabs />

      {/* Page Content */}
      <div className="relative z-10">{children}</div>

      {/* Floating Atmospheric Details */}
      <div className="absolute inset-0 pointer-events-none z-[-1] opacity-20 overflow-hidden">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-secondary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-primary/10 blur-[140px] rounded-full"></div>
      </div>
    </main>
  );
}
