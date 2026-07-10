"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, type Purchase, type Supplier } from "@/lib/app-data";
import { useAuth } from "@/lib/auth-context";

const initialPurchases: Purchase[] = [
  { id: "1", supplierId: "s1", faktur: "INV-001", total: 12500000, status: "Pending", tanggal: "2026-01-15T10:30:00Z" },
  { id: "2", supplierId: "s2", faktur: "INV-002", total: 8750000, status: "Lunas", tanggal: "2026-01-10T14:00:00Z" },
];

const initialSuppliers: Supplier[] = [
  { id: "s1", nama: "PT Sehat Makmur", alamat: "Jl. Kesehatan No. 10", kota: "Bandung", telepon: "021-5555001", email: "sales@sehatmakmur.com", pic: "Budi", status: "Aktif" },
  { id: "s2", nama: "CV Farma Jaya", alamat: "Jl. Farmasi No. 25", kota: "Jakarta", telepon: "021-5555002", email: "cs@farmajaya.com", pic: "Siti", status: "Aktif" },
];

export default function PembelianPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Purchase | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    supplierId: initialSuppliers[0]?.id ?? "",
    faktur: "",
    total: 0,
    status: "Pending" as Purchase["status"],
    tanggal: new Date().toISOString().slice(0, 10),
  });

  const { canEdit, canDelete, canAdd } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [purchaseData, supplierData] = await Promise.all([
          fetch("/api/purchases").then((res) => res.json() as Promise<Purchase[]>),
          fetch("/api/suppliers").then((res) => res.json() as Promise<Supplier[]>),
        ]);
        setPurchases(purchaseData);
        setSuppliers(supplierData);
        return;
      } catch {
        // fallback
      }

      const savedPurchases = window.localStorage.getItem("purchases");
      if (savedPurchases) setPurchases(JSON.parse(savedPurchases) as Purchase[]);

      const savedSuppliers = window.localStorage.getItem("suppliers");
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers) as Supplier[]);
    };

    void load();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    window.localStorage.setItem("suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  const filtered = useMemo(
    () =>
      purchases.filter((item) => {
        const supplier = suppliers.find((s) => s.id === item.supplierId);
        const matchesQuery = `${item.faktur} ${supplier?.nama ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesQuery;
      }),
    [purchases, suppliers, query]
  );

  const handleAdd = async () => {
    if (!suppliers.length) {
      alert("Tidak ada supplier. Tambahkan supplier terlebih dahulu.");
      return;
    }

    const newPurchase: Purchase = {
      id: crypto.randomUUID(),
      supplierId: form.supplierId || suppliers[0]!.id,
      faktur: form.faktur.trim(),
      total: form.total,
      status: form.status,
      tanggal: `${form.tanggal}T00:00:00.000Z`,
    };

    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPurchase),
    });

    if (response.ok) {
      const data = (await response.json()) as Purchase[];
      setPurchases(data);
      setShowAddForm(false);
      setForm({
        supplierId: suppliers[0]?.id ?? "",
        faktur: "",
        total: 0,
        status: "Pending",
        tanggal: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleEdit = (item: Purchase) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    const response = await fetch("/api/purchases", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    if (response.ok) {
      const data = (await response.json()) as Purchase[];
      setPurchases(data);
      setEditingId(null);
      setEditData(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus pembelian ini?")) return;

    const response = await fetch("/api/purchases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      const data = (await response.json()) as Purchase[];
      setPurchases(data);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-pink-200 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pembelian dari Supplier</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Catat faktur, total tagihan, dan status pembayaran dengan mudah.
              </p>
            </div>

            {canAdd && (
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setForm((prev) => ({
                    ...prev,
                    supplierId: suppliers[0]?.id ?? prev.supplierId,
                  }));
                }}
                className="rounded-2xl bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/30 transition-all hover:shadow-lg dark:from-pink-600 dark:to-pink-700"
              >
                ➕ Tambah Pembelian
              </button>
            )}
          </div>
        </header>

        {showAddForm && canAdd && (
          <section className="rounded-3xl border border-pink-200 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tambah Pembelian Manual</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Isi supplier, faktur, total, status, dan tanggal order secara manual.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Supplier
                <select
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.nama}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Tanggal Order
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Nomor Faktur
                <input
                  value={form.faktur}
                  onChange={(e) => setForm({ ...form, faktur: e.target.value })}
                  placeholder="INV-2026-001"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Total Harga
                <input
                  type="number"
                  min={0}
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                  placeholder="0"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                Status Pembayaran
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Purchase['status'] })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Pending">Pending</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Diterima">Diterima</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => void handleAdd()}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Simpan Pembelian
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-emerald-900">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Pembelian</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">{purchases.length}</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 dark:border-blue-900 dark:from-blue-950 dark:to-blue-900">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Pending</p>
            <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
              {purchases.filter((item) => item.status === "Pending").length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-emerald-900">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Lunas</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {purchases.filter((item) => item.status === "Lunas").length}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-pink-200 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Riwayat Pembelian</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Data pembelian dan status hutang supplier.</p>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari faktur atau supplier..."
              className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm transition-all placeholder-slate-400 focus:ring-2 focus:ring-pink-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-pink-400 md:max-w-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-pink-100 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-pink-50 to-pink-100 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold">Faktur</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                  <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-pink-100 transition-all hover:bg-pink-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {suppliers.find((s) => s.id === item.supplierId)?.nama ?? "Supplier"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.faktur}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Lunas"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            aria-label="Edit pembelian"
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => void handleDelete(item.id)}
                            className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition-all hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                            aria-label="Hapus pembelian"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {editingId && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-pink-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Pembelian</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Faktur</label>
                  <input
                    type="text"
                    value={editData.faktur}
                    onChange={(e) => setEditData({ ...editData, faktur: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total</label>
                  <input
                    type="number"
                    value={editData.total}
                    onChange={(e) => setEditData({ ...editData, total: Number(e.target.value) })}
                    className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as Purchase['status'] })}
                    className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Diterima">Diterima</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => void handleSaveEdit()}
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
                  >
                    Simpan Perubahan
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditData(null);
                    }}
                    className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

