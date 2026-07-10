"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { User } from '@/lib/app-data';

const initialUserForm = { nama: '', role: 'kasir' as User['role'], status: 'Aktif' as User['status'] };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialUserForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { canManageMaster } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          setUsers((await response.json()) as User[]);
        }
      } catch {
      }
    };
    void loadUsers();
  }, []);

  const saveUser = async () => {
    if (!form.nama.trim()) {
      alert('Nama pengguna harus diisi.');
      return;
    }

    const payload = editingId ? { ...form, id: editingId } : { ...form, id: crypto.randomUUID() };
    const response = await fetch('/api/users', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setUsers((await response.json()) as User[]);
      setForm(initialUserForm);
      setEditingId(null);
    }
  };

  const editUser = (user: User) => {
    setEditingId(user.id);
    setForm({ nama: user.nama, role: user.role, status: user.status });
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      setUsers((await response.json()) as User[]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Pengguna</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Kelola Admin dan Kasir dengan hak akses operasional yang sesuai.</p>
            </div>
            {canManageMaster && (
              <button onClick={() => { setEditingId(null); setForm(initialUserForm); }} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">+ Tambah Pengguna</button>
            )}
          </div>
        </header>

        {canManageMaster && (
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Form Pengguna</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Nama Pengguna
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Role
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="admin">Admin</option>
                  <option value="kasir">Kasir</option>
                </select>
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as User['status'] })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button onClick={saveUser} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Simpan Pengguna</button>
              <button onClick={() => { setForm(initialUserForm); setEditingId(null); }} className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Reset</button>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Pengguna</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Admin dapat melihat dan mengelola akun pengguna dari sini.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{users.length} pengguna</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  {canManageMaster && <th className="px-4 py-3 font-semibold">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.nama}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.role}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>{item.status}</span>
                    </td>
                    {canManageMaster && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => editUser(item)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">Edit</button>
                          <button onClick={() => void deleteUser(item.id)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700">Hapus</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
