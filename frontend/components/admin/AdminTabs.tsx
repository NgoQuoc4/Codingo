'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminTabs() {
  const pathname = usePathname();

  const tabs = [
    { id: 'stats', name: 'Tổng quan', icon: 'dashboard', path: '/admin' },
    { id: 'users', name: 'Học viên', icon: 'group', path: '/admin/users' },
    { id: 'theory', name: 'Lý thuyết', icon: 'menu_book', path: '/admin/theory' },
    { id: 'practices', name: 'Lộ trình', icon: 'map', path: '/admin/practices' },
  ];

  return (
    <div className="flex gap-2 border-b-4 border-surface-container pb-4 mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        // Match exactly /admin or check prefix if there's nested navigation
        // /admin maps exactly to stats tab, others map to startsWith tab.path
        const isActive = tab.path === '/admin' 
          ? pathname === '/admin'
          : pathname.startsWith(tab.path);

        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-b-4 font-bold text-xs uppercase transition-all active:translate-y-[2px] active:border-b-2 whitespace-nowrap ${
              isActive
                ? 'bg-secondary text-on-secondary border-secondary-dark'
                : 'bg-surface-container text-on-surface-variant border-black/20 hover:bg-surface-bright'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {tab.icon}
            </span>
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
