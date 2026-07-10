'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useAuth, type UserRole } from '@/lib/auth-context';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/stok', label: 'Stok Obat' },
  { href: '/penjualan', label: 'Penjualan' },
  { href: '/pembelian', label: 'Pembelian' },
  { href: '/supplier', label: 'Supplier' },
  { href: '/laporan', label: 'Laporan' },
  { href: '/users', label: 'Pengguna' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user, login } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleChangeRole = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      admin: 'Admin',
      kasir: 'Kasir',
    };
    login(roleNames[role], role);
    setShowRoleMenu(false);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-blue-600 dark:bg-blue-500',
    kasir: 'bg-emerald-600 dark:bg-emerald-500',
  };

  const roleBadges: Record<UserRole, string> = {
    admin: 'Admin',
    kasir: 'Kasir',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 text-slate-800 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="mx-auto flex max-w-full flex-col gap-0 p-0 lg:flex-row">
        <aside className="w-full rounded-b-3xl border-b border-pink-200 bg-white/90 p-4 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:rounded-r-3xl lg:rounded-b-none lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Apotek Kampus Sehat Farma" className="h-10 w-10 rounded-2xl border border-pink-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400">Apotek</p>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Kampus Sehat</h2>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-full border border-pink-200 bg-pink-50 px-3 py-2 text-lg text-slate-700 transition-all hover:bg-pink-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-pink-100 to-pink-50 px-3 py-3 dark:from-slate-800 dark:to-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Pengguna</p>
                <p className="font-medium text-slate-900 dark:text-white">{user?.nama}</p>
              </div>
              <span className={`${roleColors[user?.role || 'kasir']} rounded-full px-2.5 py-1 text-xs font-semibold text-white`}>
                {roleBadges[user?.role || 'kasir']}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="w-full rounded-2xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/30 transition-all hover:bg-pink-700 dark:bg-pink-600 dark:hover:bg-pink-700"
              >
                Ubah Role
              </button>
              {showRoleMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 space-y-2 rounded-2xl bg-white p-3 shadow-lg dark:bg-slate-800 z-50">
                  {(['admin', 'kasir'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleChangeRole(role)}
                      className={`w-full rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        user?.role === role
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {roleBadges[role]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-pink-100 hover:text-pink-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-pink-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 p-4 text-center text-xs text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-400">
            <p className="font-semibold">Sehat Bersama, Prestasi Utama</p>
            <p className="mt-1 text-slate-500 dark:text-slate-500">© 2026 Apotek Kampus</p>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
