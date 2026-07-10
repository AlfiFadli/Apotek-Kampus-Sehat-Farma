"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency, type Medicine, type Purchase, type Sale, type Supplier } from '@/lib/app-data';

export default function HomePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const readLocal = <T,>(key: string, fallback: T[]): T[] => {
      if (typeof window === 'undefined') return fallback;
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : fallback;
    };

    const load = async () => {
      try {
        const [medicineData, saleData, purchaseData, supplierData] = await Promise.all([
          fetch('/api/medicines').then((response) => response.json() as Promise<Medicine[]>),
          fetch('/api/sales').then((response) => response.json() as Promise<Sale[]>),
          fetch('/api/purchases').then((response) => response.json() as Promise<Purchase[]>),
          fetch('/api/suppliers').then((response) => response.json() as Promise<Supplier[]>),
        ]);

        setMedicines(medicineData);
        setSales(saleData);
        setPurchases(purchaseData);
        setSuppliers(supplierData);
      } catch {
        setMedicines(readLocal<Medicine>('medicines', []));
        setSales(readLocal<Sale>('sales', []));
        setPurchases(readLocal<Purchase>('purchases', []));
        setSuppliers(readLocal<Supplier>('suppliers', []));
      }
    };

    void load();
  }, []);

  const totalStock = medicines.reduce((sum, item) => sum + item.stok, 0);
  const lowStock = medicines.filter((item) => item.stok <= 10).length;
  const expired = medicines.filter((item) => new Date(item.tanggalKadaluarsa) < new Date()).length;
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((item) => item.tanggal.slice(0, 10) === today).reduce((sum, item) => sum + item.total, 0);
  const purchaseTotal = purchases.reduce((sum, item) => sum + item.total, 0);

  const alerts = useMemo(() => {
    return [
      ...medicines.filter((item) => item.stok <= 10).slice(0, 2).map((item) => ({ title: 'Stok menipis', desc: `${item.nama} tersisa ${item.stok}`, time: 'Baru saja' })),
      ...medicines.filter((item) => new Date(item.tanggalKadaluarsa) < new Date()).slice(0, 1).map((item) => ({ title: 'Kadaluarsa', desc: `${item.nama} telah melewati tanggal kadaluarsa`, time: 'Perlu tindakan' })),
    ];
  }, [medicines]);

  const stats = [
    { label: 'Total Stok Obat', value: totalStock.toLocaleString('id-ID'), detail: 'Item tersimpan' },
    { label: 'Penjualan Hari Ini', value: formatCurrency(todaySales), detail: `${sales.length} transaksi tercatat` },
    { label: 'Pembelian Supplier', value: formatCurrency(purchaseTotal), detail: `${purchases.length} faktur` },
    { label: 'Obat Hampir Habis', value: lowStock.toString(), detail: 'Perlu restock' },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_35%),linear-gradient(135deg,_#f8fffb_0%,_#f4f8ff_100%)] p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Apotek Kampus Sehat Farma</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard apotek profesional</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Sistem modern untuk mengelola stok, penjualan, pembelian, dan laporan secara terintegrasi dari desktop maupun ponsel.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/stok" className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20">Kelola Stok</Link>
              <Link href="/penjualan" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Kasir</Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-2 text-sm text-emerald-600">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ringkasan Operasional</h2>
                <p className="text-sm text-slate-500">Data real-time dari stok, penjualan, dan supplier</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Aktif</span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Supplier</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{suppliers.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Kadaluarsa</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{expired}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Transaksi</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{sales.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Notifikasi & Alert</h2>
            <div className="mt-4 space-y-3">
              {alerts.length > 0 ? alerts.map((item) => (
                <div key={`${item.title}-${item.desc}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.time}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Tidak ada alert saat ini.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
