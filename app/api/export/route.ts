import { NextResponse } from 'next/server';
import { getMedicines, getPurchases, getSales, getSuppliers } from '@/lib/store';

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinRange(itemDate: string, from?: string, to?: string) {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'json';
  const resource = searchParams.get('resource') ?? 'sales';
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  if (resource === 'sales') {
    const data = await getSales();
    const filtered = from || to ? data.filter((item) => isWithinRange(item.tanggal, from, to)) : data;
    if (type === 'csv') {
      const csv = ['nomorTransaksi,tanggal,kasir,customer,total,laba,status', ...filtered.map((item) => `${item.nomorTransaksi},${item.tanggal},${item.kasir},${item.customer ?? ''},${item.total},${item.laba},${item.status}`)];
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=laporan-penjualan.csv' } });
    }
    return NextResponse.json(filtered);
  }

  if (resource === 'purchases') {
    const data = await getPurchases();
    const suppliers = await getSuppliers();
    const filtered = from || to ? data.filter((item) => isWithinRange(item.tanggal, from, to)) : data;
    if (type === 'csv') {
      const csv = ['faktur,tanggal,supplier,status,total', ...filtered.map((item) => {
        const supplierName = suppliers.find((supplier) => supplier.id === item.supplierId)?.nama ?? item.supplierId;
        return `${item.faktur},${item.tanggal},${supplierName},${item.status},${item.total}`;
      })];
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=laporan-pembelian.csv' } });
    }
    return NextResponse.json(filtered);
  }

  if (resource === 'medicines') {
    const data = await getMedicines();
    if (type === 'csv') {
      const csv = ['kode,nama,kategori,stok,hargaJual', ...data.map((item) => `${item.kode},${item.nama},${item.kategori},${item.stok},${item.hargaJual}`)];
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=stok-obat.csv' } });
    }
    return NextResponse.json(data);
  }

  const suppliers = await getSuppliers();
  if (type === 'csv') {
    const csv = ['nama,alamat,telepon,email,pic', ...suppliers.map((item) => `${item.nama},${item.alamat},${item.telepon},${item.email},${item.pic}`)];
    return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=supplier.csv' } });
  }
  return NextResponse.json(suppliers);
}
