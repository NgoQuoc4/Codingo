'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Route protection: redirect to login if unauthenticated
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login');
    }
  }, [token, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">refresh</span>
        <p className="font-extrabold text-on-surface-variant/80">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative">
      <Sidebar />
      {/* Main Content Layout Container */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 flex flex-col lg:flex-row h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
