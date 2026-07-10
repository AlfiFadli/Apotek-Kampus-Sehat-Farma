'use client';

import { useAuth } from '@/lib/auth-context';

const categories = ['Antibiotik', 'Analgesik', 'Antipiretik', 'Vitamin', 'Obat Batuk', 'Obat Flu', 'Obat Maag', 'Obat Diabetes', 'Obat Hipertensi', 'Obat Kulit', 'Obat Anak', 'Herbal'];

export default function KategoriPage() {
  const { canManageMaster } = useAuth();
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategori Obat</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Kelola kategori obat yang dapat ditambah dan disesuaikan sesuai kebutuhan apotek.</p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Kategori</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Kategori siap digunakan untuk pencatatan dan pengelompokan obat.</p>
            </div>
            {canManageMaster && (
              <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">+ Tambah Kategori</button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
                <p className="font-medium text-slate-800 dark:text-slate-100">{item}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Terintegrasi pada data obat dan rekomendasi penyakit</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
