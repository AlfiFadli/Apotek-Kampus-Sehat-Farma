export type MedicineStatus = 'Aman' | 'Menipis' | 'Kadaluarsa' | 'Habis';

export type Medicine = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  jenis: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  satuan: string;
  tanggalMasuk: string;
  tanggalKadaluarsa: string;
  supplier: string;
  lokasi: string;
  status: MedicineStatus;
};

export type Category = {
  id: string;
  nama: string;
};

export type Disease = {
  id: string;
  nama: string;
  obatIds: string[];
};

export type Supplier = {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  telepon: string;
  email: string;
  pic: string;
  status: 'Aktif' | 'Nonaktif';
};

export type Purchase = {
  id: string;
  supplierId: string;
  faktur: string;
  total: number;
  status: 'Pending' | 'Lunas' | 'Diterima';
  tanggal: string;
  catatan?: string;
};

export type Sale = {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  kasir: string;
  customer?: string;
  total: number;
  laba: number;
  status: 'Berhasil' | 'Batal';
  items: { nama: string; qty: number; harga: number }[];
};

export type User = {
  id: string;
  nama: string;
  role: 'admin' | 'kasir';
  status: 'Aktif' | 'Nonaktif';
};

export function getMedicineStatus(stok: number, tanggalKadaluarsa?: string) {
  if (tanggalKadaluarsa && new Date(tanggalKadaluarsa) < new Date()) return 'Kadaluarsa';
  if (stok <= 0) return 'Habis';
  if (stok <= 10) return 'Menipis';
  return 'Aman';
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export function calculateSaleSummary(items: { qty: number; harga: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.harga, 0);
  const diskon = Math.round(subtotal * 0.05);
  const pajak = Math.round((subtotal - diskon) * 0.1);
  const total = subtotal - diskon + pajak;
  return { subtotal, diskon, pajak, total };
}
