import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Medicine, Supplier, Purchase, Sale, User } from '@/lib/app-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILES = {
  medicines: 'medicines.json',
  suppliers: 'suppliers.json',
  purchases: 'purchases.json',
  sales: 'sales.json',
  users: 'users.json',
};

const defaultMedicines: Medicine[] = [
  { id: 'med-1', kode: 'OBT-001', nama: 'Paracetamol 500mg', kategori: 'Antipiretik', jenis: 'Tablet', hargaBeli: 1200, hargaJual: 1800, stok: 120, satuan: 'strip', tanggalMasuk: '2026-01-10', tanggalKadaluarsa: '2027-08-10', supplier: 'PT Sehat Makmur', lokasi: 'Rak A1', status: 'Aman' },
  { id: 'med-2', kode: 'OBT-002', nama: 'Amoxicillin 250mg', kategori: 'Antibiotik', jenis: 'Kapsul', hargaBeli: 2500, hargaJual: 3200, stok: 8, satuan: 'box', tanggalMasuk: '2026-02-05', tanggalKadaluarsa: '2026-12-01', supplier: 'CV Farma Jaya', lokasi: 'Rak B4', status: 'Menipis' },
  { id: 'med-3', kode: 'OBT-003', nama: 'Omeprazole 20mg', kategori: 'Obat Maag', jenis: 'Tablet', hargaBeli: 3000, hargaJual: 4200, stok: 0, satuan: 'box', tanggalMasuk: '2026-03-12', tanggalKadaluarsa: '2026-11-20', supplier: 'PT Sehat Makmur', lokasi: 'Rak C2', status: 'Habis' },
];

const defaultSuppliers: Supplier[] = [
  { id: 'sup-1', nama: 'PT Sehat Makmur', alamat: 'Bandung', kota: 'Bandung', telepon: '022-123456', email: 'sales@sehatmakmur.com', pic: 'Budi Santoso', status: 'Aktif' },
  { id: 'sup-2', nama: 'CV Farma Jaya', alamat: 'Jakarta', kota: 'Jakarta', telepon: '021-654321', email: 'cs@farmajaya.com', pic: 'Sinta', status: 'Aktif' },
];

const defaultPurchases: Purchase[] = [
  { id: 'pur-1', supplierId: 'sup-1', faktur: 'INV-1001', total: 12400000, status: 'Lunas', tanggal: '2026-06-20' },
  { id: 'pur-2', supplierId: 'sup-2', faktur: 'INV-1002', total: 8600000, status: 'Pending', tanggal: '2026-07-01' },
];

const defaultSales: Sale[] = [
  { id: 'sale-1', nomorTransaksi: 'TRX-001', tanggal: '2026-07-10T10:00:00.000Z', kasir: 'Admin', customer: 'Pelanggan Umum', total: 42000, laba: 12000, status: 'Berhasil', items: [{ nama: 'Paracetamol 500mg', qty: 2, harga: 1800 }] },
];

const defaultUsers: User[] = [
  { id: 'user-1', nama: 'Dr. Sari', role: 'admin', status: 'Aktif' },
  { id: 'user-2', nama: 'Rina', role: 'kasir', status: 'Aktif' },
  { id: 'user-3', nama: 'Doni', role: 'kasir', status: 'Aktif' },
];

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  await ensureStore();
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    await writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeJson<T>(fileName: string, data: T) {
  await ensureStore();
  const filePath = path.join(DATA_DIR, fileName);
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function getMedicines() {
  return readJson<Medicine[]>(FILES.medicines, defaultMedicines);
}

export async function saveMedicines(data: Medicine[]) {
  await writeJson(FILES.medicines, data);
  return data;
}

export async function deleteMedicine(id: string) {
  const medicines = await getMedicines();
  const next = medicines.filter((item) => item.id !== id);
  await saveMedicines(next);
  return next;
}

export async function getSuppliers() {
  return readJson<Supplier[]>(FILES.suppliers, defaultSuppliers);
}

export async function saveSuppliers(data: Supplier[]) {
  await writeJson(FILES.suppliers, data);
  return data;
}

export async function getPurchases() {
  return readJson<Purchase[]>(FILES.purchases, defaultPurchases);
}

export async function savePurchases(data: Purchase[]) {
  await writeJson(FILES.purchases, data);
  return data;
}

export async function getSales() {
  return readJson<Sale[]>(FILES.sales, defaultSales);
}

export async function saveSales(data: Sale[]) {
  await writeJson(FILES.sales, data);
  return data;
}

export async function getUsers() {
  return readJson<User[]>(FILES.users, defaultUsers);
}

export async function saveUsers(data: User[]) {
  await writeJson(FILES.users, data);
  return data;
}

export function getMedicineStatus(stok: number, tanggalKadaluarsa?: string) {
  if (tanggalKadaluarsa && new Date(tanggalKadaluarsa) < new Date()) return 'Kadaluarsa';
  if (stok <= 0) return 'Habis';
  if (stok <= 10) return 'Menipis';
  return 'Aman';
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}
