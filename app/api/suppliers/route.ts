import { NextResponse } from 'next/server';
import { getSuppliers, saveSuppliers } from '@/lib/store';

export async function GET() {
  const suppliers = await getSuppliers();
  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const suppliers = await getSuppliers();
  const next = [...suppliers, payload];
  await saveSuppliers(next);
  return NextResponse.json(next);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const suppliers = await getSuppliers();
  const next = suppliers.map((item) => (item.id === payload.id ? payload : item));
  await saveSuppliers(next);
  return NextResponse.json(next);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const suppliers = await getSuppliers();
  const next = suppliers.filter((item) => item.id !== id);
  await saveSuppliers(next);
  return NextResponse.json(next);
}
