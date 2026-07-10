"use client";

import { useEffect, useMemo, useState } from 'react';
import { formatCurrency, type Medicine, type Purchase, type Sale } from '@/lib/app-data';

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinRange(itemDate: string, from: string, to: string) {
  const item = parseDate(itemDate);
  if (!item) return false;
  if (from) {
    const start = parseDate(from);
    if (start && item < start) return false;
  }
  if (to) {
    const end = parseDate(to);
    if (end) {
      end.setHours(23, 59, 59, 999);
      if (item > end) return false;
    }
  }
  return true;
}

export default function LaporanPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [saleData, purchaseData, medicineData] = await Promise.all([
          fetch('/api/sales').then((response) => response.json() as Promise<Sale[]>),
          fetch('/api/purchases').then((response) => response.json() as Promise<Purchase[]>),
          fetch('/api/medicines').then((response) => response.json() as Promise<Medicine[]>),
        ]);
        setSales(saleData);
        setPurchases(purchaseData);
        setMedicines(medicineData);
      } catch {
        setSales([]);
        setPurchases([]);
        setMedicines([]);
      }
    };

    void load();
  }, []);

  const filteredSales = useMemo(
    () => sales.filter((item) => isWithinRange(item.tanggal, dateFrom, dateTo)),
    [sales, dateFrom, dateTo]
  );

  const filteredPurchases = useMemo(
    () => purchases.filter((item) => isWithinRange(item.tanggal, dateFrom, dateTo)),
    [purchases, dateFrom, dateTo]
  );

  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, item) => sum + item.total, 0);
    const totalProfit = filteredSales.reduce((sum, item) => sum + item.laba, 0);
    const topItem = filteredSales
      .flatMap((item) => item.items)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.nama] = (acc[item.nama] ?? 0) + item.qty;
        return acc;
      }, {});
    const topDrug = Object.entries(topItem).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Belum ada data';
    const lowStock = medicines.filter((item) => item.stok <= 10).length;
    const pendingPurchases = filteredPurchases.filter((item) => item.status === 'Pending').length;

    return { totalSales, totalProfit, topDrug, lowStock, pendingPurchases };
  }, [filteredSales, filteredPurchases, medicines]);

  const exportExcel = (resource: 'sales' | 'purchases') => {
    const params = new URLSearchParams();
    params.set('type', 'csv');
    params.set('resource', resource);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    window.open(`/api/export?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const exportPdf = () => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html>
      <html>
        <head><title>Laporan Apotek</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h1{margin-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}th{background:#f3f4f6}section{margin-top:24px}</style></head>
        <body>
          <h1>Laporan Pembukuan Apotek</h1>
          <p>Periode: ${dateFrom || 'Awal'} sampai ${dateTo || 'Sekarang'}</p>
          <ul>
            <li>Total penjualan: ${formatCurrency(summary.totalSales)}</li>
            <li>Total laba: ${formatCurrency(summary.totalProfit)}</li>
            <li>Obat terlaris: ${summary.topDrug}</li>
            <li>Stok menipis: ${summary.lowStock}</li>
            <li>Pembelian tertunda: ${summary.pendingPurchases}</li>
          </ul>
          <section>
            <h2>Penjualan</h2>
            <table>
              <thead><tr><th>Nomor</th><th>Tanggal</th><th>Customer</th><th>Total</th><th>Laba</th></tr></thead>
              <tbody>${filteredSales
                .map(
                  (item) => `<tr><td>${item.nomorTransaksi}</td><td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td><td>${item.customer ?? '-'}</td><td>${formatCurrency(item.total)}</td><td>${formatCurrency(item.laba)}</td></tr>`
                )
                .join('')}</tbody>
            </table>
          </section>
          <section>
            <h2>Pembelian</h2>
            <table>
              <thead><tr><th>Faktur</th><th>Tanggal</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>${filteredPurchases
                .map(
                  (item) => `<tr><td>${item.faktur}</td><td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td><td>${item.status}</td><td>${formatCurrency(item.total)}</td></tr>`
                )
                .join('')}</tbody>
            </table>
          </section>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Laporan & Pembukuan</h1>
              <p className="mt-2 text-sm text-slate-600">Pantau penjualan dan pembelian sesuai tanggal, lalu unduh laporan terfilter.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => exportExcel('sales')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Export Penjualan</button>
              <button onClick={() => exportExcel('purchases')} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Export Pembelian</button>
              <button onClick={exportPdf} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Print PDF</button>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm text-slate-600">
              Tanggal Mulai
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Tanggal Akhir
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Penjualan</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalSales)}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Laba Bersih</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalProfit)}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pembelian Tertunda</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.pendingPurchases}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Laporan Penjualan</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nomor</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Kasir</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Laba</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.nomorTransaksi}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.customer ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.kasir}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.laba)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Laporan Pembelian</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Faktur</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.faktur}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.status}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.total)}</td>
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
