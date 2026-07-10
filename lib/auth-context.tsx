'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'kasir';

interface User {
  id: string;
  nama: string;
  role: UserRole;
}

interface AuthContextType {
  user: User;
  login: (nama: string, role: UserRole) => void;
  logout: () => void;
  isAdmin: boolean;
  isKasir: boolean;
  canManageMaster: boolean;
  canProcessTransaction: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ id: 'user-default', nama: 'Kasir', role: 'kasir' });

  useEffect(() => {
    const saved = window.localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved) as User);
    }
  }, []);

  const login = (nama: string, role: UserRole) => {
    const newUser = { id: crypto.randomUUID(), nama, role };
    setUser(newUser);
    window.localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    const defaultUser: User = { id: 'user-default', nama: 'Kasir', role: 'kasir' };
    setUser(defaultUser);
    window.localStorage.removeItem('user');
  };

  const isAdmin = user.role === 'admin';
  const isKasir = user.role === 'kasir';
  const canManageMaster = isAdmin;
  const canProcessTransaction = isAdmin || isKasir;
  const canAdd = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isKasir, canManageMaster, canProcessTransaction, canAdd, canEdit, canDelete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
