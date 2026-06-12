'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSessionUser() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="text-xs font-bold text-on-surface-variant/40">
      Admin Session:{' '}
      <span className="text-secondary font-black">{user.username}</span>
    </div>
  );
}
