'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  xp: number;
  hearts: number;
  lastHeartReset: string;
  streak: number;
  lastActive: string;
  avatar?: string;
  soundEffects?: boolean;
  animations?: boolean;
  motivationalMessages?: boolean;
  listeningExercises?: boolean;
  darkMode?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loseHeart: () => Promise<number>;
  refillHearts: () => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  addXp: (amount: number) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token might have expired
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/learn');
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/learn');
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const loseHeart = async (): Promise<number> => {
    if (!token || !user) return 0;
    try {
      const res = await fetch(`${API_URL}/users/lose-heart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.hearts;
      }
    } catch (err) {
      console.error('Error losing heart', err);
    }
    return user.hearts;
  };

  const refillHearts = async () => {
    if (!token || !user) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/refill-hearts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to refill hearts' };
      }

      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!token || !user) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to update settings' };
      }

      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  };

  const addXp = async (amount: number) => {
    if (!token || !user) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/add-xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ xp: amount }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to add XP' };
      }

      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        loseHeart,
        refillHearts,
        refreshUser,
        updateUser,
        addXp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
