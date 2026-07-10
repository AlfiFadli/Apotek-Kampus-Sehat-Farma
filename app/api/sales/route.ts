import { NextResponse } from 'next/server';
import { getSales, saveSales } from '@/lib/store';

export async function GET() {
  const sales = await getSales();
  return NextResponse.json(sales);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const sales = await getSales();
  const next = [payload, ...sales];
  await saveSales(next);
  return NextResponse.json(next);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const sales = await getSales();
  const next = sales.map((item) => (item.id === payload.id ? payload : item));
  await saveSales(next);
  return NextResponse.json(next);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const sales = await getSales();
  const next = sales.filter((item) => item.id !== id);
  await saveSales(next);
  return NextResponse.json(next);
}
