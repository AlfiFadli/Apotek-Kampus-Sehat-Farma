"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Supplier } from '@/lib/app-data';

const initialSupplier = {
  nama: '',
  alamat: '',
  kota: '',
  telepon: '',
  email: '',
  pic: '',
  status: 'Aktif' as Supplier['status'],
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({ ...initialSupplier });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { canManageMaster } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/suppliers');
        if (response.ok) {
          setSuppliers((await response.json()) as Supplier[]);
        }
      } catch {
      }
    };
    void load();
  }, []);

  const resetForm = () => {
    setForm({ ...initialSupplier });
    setEditingId(null);
  };

  const saveSupplier = async () => {
    if (!form.nama.trim() || !form.alamat.trim() || !form.kota.trim() || !form.telepon.trim() || !form.email.trim() || !form.pic.trim()) {
      alert('Lengkapi semua field supplier sebelum menyimpan.');
      return;
    }

    const payload = editingId
      ? { ...form, id: editingId }
      : { ...form, id: crypto.randomUUID() };

    const response = await fetch('/api/suppliers', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setSuppliers((await response.json()) as Supplier[]);
      resetForm();
    }
  };

  const editSupplier = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setForm({ ...supplier });
  };

  const deleteSupplier = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus supplier ini?')) return;
    const response = await fetch('/api/suppliers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      setSuppliers((await response.json()) as Supplier[]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Supplier</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Kelola supplier dengan data lengkap untuk pembelian dan sebaran stok obat.</p>
            </div>
            {canManageMaster && (
              <button onClick={resetForm} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">+ Supplier Baru</button>
            )}
          </div>
        </header>

        {canManageMaster && (
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Form Supplier</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Nama Perusahaan
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Kota
                <input
                  value={form.kota}
                  onChange={(e) => setForm({ ...form, kota: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300 lg:col-span-2">
                Alamat
                <textarea
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Nomor Telepon
                <input
                  value={form.telepon}
                  onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Nama Kontak
                <input
                  value={form.pic}
                  onChange={(e) => setForm({ ...form, pic: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Supplier['status'] })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button onClick={saveSupplier} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Simpan Supplier</button>
              <button onClick={resetForm} className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Reset</button>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Supplier Terdaftar</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tabel ini menampilkan semua supplier yang dapat digunakan untuk pembelian.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{suppliers.length} Supplier</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Perusahaan</th>
                  <th className="px-4 py-3 font-semibold">Alamat</th>
                  <th className="px-4 py-3 font-semibold">Kota</th>
                  <th className="px-4 py-3 font-semibold">Telepon</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Kontak</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  {canManageMaster && <th className="px-4 py-3 font-semibold">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.nama}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.alamat}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.kota}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.telepon}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.email}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.pic}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>{item.status}</span>
                    </td>
                    {canManageMaster && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editSupplier(item)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void deleteSupplier(item.id)}
                            className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                          >
                            Hapus
                          </button>
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
