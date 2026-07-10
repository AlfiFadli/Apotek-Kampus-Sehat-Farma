"use client";

import { useEffect, useMemo, useState } from 'react';
import { calculateSaleSummary, formatCurrency, type Medicine, type Sale } from '@/lib/app-data';
import { useAuth } from '@/lib/auth-context';

export default function PenjualanPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customer, setCustomer] = useState('Pelanggan Umum');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [qty, setQty] = useState(1);
  const [cartItems, setCartItems] = useState<{ nama: string; qty: number; harga: number }[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const { user, canProcessTransaction } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [saleData, medicineData] = await Promise.all([
          fetch('/api/sales').then((response) => response.json() as Promise<Sale[]>),
          fetch('/api/medicines').then((response) => response.json() as Promise<Medicine[]>),
        ]);

        setSales(saleData);
        setMedicines(medicineData);
        setSelectedMedicineId(medicineData[0]?.id ?? '');
      } catch {
        setSales([]);
        setMedicines([]);
      }
    };

    void load();
  }, []);

  const summary = useMemo(() => calculateSaleSummary(cartItems), [cartItems]);
  const selectedMedicine = medicines.find((item) => item.id === selectedMedicineId);

  const handleAddItem = () => {
    if (!selectedMedicine) return;
    if (qty <= 0) return;

    setCartItems((current) => {
      const existing = current.find((item) => item.nama === selectedMedicine.nama);
      if (existing) {
        return current.map((item) =>
          item.nama === selectedMedicine.nama ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...current, { nama: selectedMedicine.nama, qty, harga: selectedMedicine.hargaJual }];
    });

    setQty(1);
    setMessage(null);
  };

  const handleUpdateQty = (name: string, value: number) => {
    setCartItems((current) =>
      current.map((item) => (item.nama === name ? { ...item, qty: Math.max(1, value) } : item))
    );
  };

  const handleRemoveItem = (name: string) => {
    setCartItems((current) => current.filter((item) => item.nama !== name));
  };

  const handleComplete = async () => {
    if (!canProcessTransaction) return;
    if (!cartItems.length) {
      setMessage('Tambahkan minimal satu obat ke keranjang terlebih dahulu.');
      return;
    }

    const payload: Sale = {
      id: crypto.randomUUID(),
      nomorTransaksi: `TRX-${Date.now().toString().slice(-4)}`,
      tanggal: `${tanggal}T00:00:00.000Z`,
      kasir: user.nama,
      customer: customer.trim() || 'Pelanggan Umum',
      total: summary.total,
      laba: Math.max(0, Math.round(summary.total * 0.12)),
      status: 'Berhasil',
      items: cartItems,
    };

    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as Sale[];
      setSales(data);
      setCartItems([]);
      setCustomer('Pelanggan Umum');
      setTanggal(new Date().toISOString().slice(0, 10));
      setMessage('Transaksi berhasil disimpan dan akan muncul di laporan.');
    } else {
      setMessage('Gagal menyimpan transaksi. Silakan coba lagi.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sistem Penjualan Obat</h1>
              <p className="mt-2 text-sm text-slate-600">Kasir dapat menambahkan customer, memilih obat, dan menyimpan penjualan langsung ke laporan.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Kasir: <span className="font-semibold">{user.nama}</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tambah Penjualan Manual</h2>
                <p className="mt-1 text-sm text-slate-600">Pilih obat dari panel admin, jumlahkan item, lalu simpan transaksi sesuai tanggal penjualan.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-600">
                Nama Customer
                <input
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Nama customer"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600">
                Tanggal Transaksi
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
              <label className="block text-sm text-slate-600">
                Pilih Obat
                <select
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.nama} - {medicine.kategori} - {formatCurrency(medicine.hargaJual)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-600">
                Jumlah
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value) || 1)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <button
                onClick={handleAddItem}
                className="mt-6 rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                Tambah Obat
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Keranjang Obat</h3>
              {cartItems.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Belum ada obat. Tambahkan minimal satu item untuk menyelesaikan transaksi.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.nama} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.nama}</p>
                          <p className="text-slate-500">Harga: {formatCurrency(item.harga)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.nama)}
                          className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-200"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Jumlah:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => handleUpdateQty(item.nama, Number(e.target.value) || 1)}
                            className="w-24 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.qty * item.harga)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Ringkasan Pembayaran</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
              <div className="flex justify-between"><span>Diskon 5%</span><span>{formatCurrency(summary.diskon)}</span></div>
              <div className="flex justify-between"><span>Pajak 10%</span><span>{formatCurrency(summary.pajak)}</span></div>
              <div className="mt-3 border-t pt-3 flex justify-between text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(summary.total)}</span></div>
            </div>
            <button
              onClick={() => {
                if (canProcessTransaction) {
                  void handleComplete();
                }
              }}
              disabled={!canProcessTransaction}
              className="mt-6 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Selesaikan Transaksi
            </button>
            {!canProcessTransaction ? (
              <p className="mt-3 text-sm text-amber-600">Anda tidak memiliki akses untuk memproses transaksi.</p>
            ) : message ? (
              <p className="mt-3 text-sm text-emerald-600">{message}</p>
            ) : null}

            <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-900">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Riwayat penjualan</p>
              <p className="mt-2">{sales.length} transaksi tersimpan</p>
            </div>
          </section>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Daftar Transaksi</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nomor</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.nomorTransaksi}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.customer ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {item.status}
                      </span>
                    </td>
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
