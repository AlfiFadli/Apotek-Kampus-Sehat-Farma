"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, getMedicineStatus, type Medicine } from "@/lib/app-data";
import { useAuth } from "@/lib/auth-context";

const initialForm = {
  medicineId: "",
  nama: "",
  kategori: "",
  manualKategori: "",
  jenis: "Tablet",
  hargaBeli: 0,
  hargaJual: 0,
  stok: 0,
  satuan: "box",
  tanggalMasuk: new Date().toISOString().slice(0, 10),
  tanggalKadaluarsa: "",
  supplier: "",
  lokasi: "Rak A1",
  status: "Aman" as Medicine["status"],
};

const statusOptions: Medicine["status"][] = ["Aman", "Menipis", "Kadaluarsa", "Habis"];

export default function StokPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { canManageMaster } = useAuth();

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await fetch("/api/medicines");
        if (response.ok) {
          setMedicines((await response.json()) as Medicine[]);
        }
      } catch {
      }
    };
    void loadMedicines();
  }, []);

  const filtered = useMemo(
    () =>
      medicines.filter((item) => {
        const matchesQuery = `${item.nama} ${item.kode}`.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === "Semua" || item.kategori === filter;
        return matchesQuery && matchesFilter;
      }),
    [medicines, query, filter]
  );

  const categories = ["Semua", ...Array.from(new Set(medicines.map((item) => item.kategori)))];
  const selectedMedicine = medicines.find((item) => item.id === form.medicineId);
  const displayCategory = isManual ? form.manualKategori || form.kategori : selectedMedicine?.kategori || form.kategori;

  const openAddForm = () => {
    setShowForm(true);
    setIsManual(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const openEditForm = (item: Medicine) => {
    setShowForm(true);
    setIsManual(false);
    setEditingId(item.id);
    setForm({
      medicineId: item.id,
      nama: item.nama,
      kategori: item.kategori,
      manualKategori: "",
      jenis: item.jenis,
      hargaBeli: item.hargaBeli,
      hargaJual: item.hargaJual,
      stok: item.stok,
      satuan: item.satuan,
      tanggalMasuk: item.tanggalMasuk,
      tanggalKadaluarsa: item.tanggalKadaluarsa,
      supplier: item.supplier,
      lokasi: item.lokasi,
      status: item.status,
    });
  };

  const saveMedicine = async () => {
    if (!form.nama.trim() || !displayCategory.trim() || form.hargaJual <= 0 || form.stok < 0 || !form.supplier.trim()) {
      alert("Lengkapi nama obat, kategori, supplier, harga, dan stok sebelum menyimpan.");
      return;
    }

    const payload: Medicine = {
      id: editingId ? form.medicineId : crypto.randomUUID(),
      kode: editingId ? selectedMedicine?.kode || `OBT-${String(medicines.length + 1).padStart(3, "0")}` : `OBT-${String(medicines.length + 1).padStart(3, "0")}`,
      nama: form.nama,
      kategori: displayCategory,
      jenis: form.jenis,
      hargaBeli: form.hargaBeli,
      hargaJual: form.hargaJual,
      stok: form.stok,
      satuan: form.satuan,
      tanggalMasuk: form.tanggalMasuk,
      tanggalKadaluarsa: form.tanggalKadaluarsa,
      supplier: form.supplier,
      lokasi: form.lokasi,
      status: form.status || getMedicineStatus(form.stok, form.tanggalKadaluarsa),
    };

    const response = await fetch("/api/medicines", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setMedicines((await response.json()) as Medicine[]);
      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus obat ini?")) return;
    const response = await fetch("/api/medicines", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      setMedicines((await response.json()) as Medicine[]);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-pink-200 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Stok Obat</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tambah obat baru atau update stok obat yang sudah ada dengan cepat.</p>
            </div>
            {canManageMaster && (
              <button
                onClick={openAddForm}
                className="rounded-2xl bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/30 transition-all hover:shadow-lg dark:from-pink-600 dark:to-pink-700"
              >
                ➕ Tambah / Update Stok
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-emerald-900">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Obat</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">{medicines.length}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 dark:border-blue-900 dark:from-blue-950 dark:to-blue-900">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Menipis</p>
            <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">{medicines.filter((item) => item.status === "Menipis").length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-amber-900">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Kadaluarsa</p>
            <p className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-100">{medicines.filter((item) => new Date(item.tanggalKadaluarsa) < new Date()).length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-pink-200 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Obat</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pantau stok, harga, dan status obat dalam satu tampilan.</p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari obat..."
                className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm transition-all placeholder-slate-400 focus:ring-2 focus:ring-pink-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-pink-400"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm transition-all dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-pink-400"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-pink-100 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-pink-50 to-pink-100 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Kode</th>
                  <th className="px-4 py-3 text-left font-semibold">Nama</th>
                  <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                  <th className="px-4 py-3 text-left font-semibold">Stok</th>
                  <th className="px-4 py-3 text-left font-semibold">Harga</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-pink-100 transition-all hover:bg-pink-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{item.kode}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.nama}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.kategori}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{item.stok}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.hargaJual)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Aman"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : item.status === "Menipis"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : item.status === "Kadaluarsa"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canManageMaster && (
                          <button
                            onClick={() => openEditForm(item)}
                            className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            ✏️
                          </button>
                        )}
                        {canManageMaster && (
                          <button
                            onClick={() => void handleDelete(item.id)}
                            className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition-all hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
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
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-pink-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? "Edit Obat" : "Tambah / Update Stok Obat"}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pilih obat yang ada atau daftar obat baru sebelum menyimpan.</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  setEditingId(null);
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => {
                      setIsManual(false);
                      setForm(initialForm);
                      setEditingId(null);
                    }}
                    className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${!isManual ? "bg-pink-600 text-white" : "bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}
                  >
                    Pilih Obat Ada
                  </button>
                  <button
                    onClick={() => {
                      setIsManual(true);
                      setForm(initialForm);
                      setEditingId(null);
                    }}
                    className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${isManual ? "bg-pink-600 text-white" : "bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}
                  >
                    Tambah Obat Baru
                  </button>
                </div>

                {!isManual ? (
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Pilih Obat
                    <select
                      value={form.medicineId}
                      onChange={(e) => {
                        const item = medicines.find((med) => med.id === e.target.value);
                        if (item) {
                          setForm({
                            medicineId: item.id,
                            nama: item.nama,
                            kategori: item.kategori,
                            manualKategori: "",
                            jenis: item.jenis,
                            hargaBeli: item.hargaBeli,
                            hargaJual: item.hargaJual,
                            stok: item.stok,
                            satuan: item.satuan,
                            tanggalMasuk: item.tanggalMasuk,
                            tanggalKadaluarsa: item.tanggalKadaluarsa,
                            supplier: item.supplier,
                            lokasi: item.lokasi,
                            status: item.status,
                          });
                        }
                      }}
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="">-- Pilih Obat --</option>
                      {medicines.map((item) => (
                        <option key={item.id} value={item.id}>{item.nama}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nama Obat Baru
                    <input
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Contoh: Vitamin C 1000mg"
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                )}

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Kategori
                    <input
                      value={form.kategori}
                      onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                      placeholder="Kategori obat"
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Kategori Baru (opsional)
                    <input
                      value={form.manualKategori}
                      onChange={(e) => setForm({ ...form, manualKategori: e.target.value })}
                      placeholder="Contoh: Suplemen"
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="grid gap-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Supplier
                    <input
                      value={form.supplier}
                      onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                      placeholder="Nama supplier"
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Stok
                    <input
                      type="number"
                      min={0}
                      value={form.stok}
                      onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Harga Jual
                    <input
                      type="number"
                      min={0}
                      value={form.hargaJual}
                      onChange={(e) => setForm({ ...form, hargaJual: Number(e.target.value) })}
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tanggal Kadaluarsa
                    <input
                      type="date"
                      value={form.tanggalKadaluarsa}
                      onChange={(e) => setForm({ ...form, tanggalKadaluarsa: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as Medicine["status"] })}
                      className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={saveMedicine}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
              >
                Simpan Obat
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  setEditingId(null);
                }}
                className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
