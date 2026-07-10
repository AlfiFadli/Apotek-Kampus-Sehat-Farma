import { NextResponse } from 'next/server';
import { getPurchases, savePurchases } from '@/lib/store';

export async function GET() {
  const purchases = await getPurchases();
  return NextResponse.json(purchases);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const purchases = await getPurchases();
  const next = [payload, ...purchases];
  await savePurchases(next);
  return NextResponse.json(next);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const purchases = await getPurchases();
  const next = purchases.map((item) => (item.id === payload.id ? payload : item));
  await savePurchases(next);
  return NextResponse.json(next);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const purchases = await getPurchases();
  const next = purchases.filter((item) => item.id !== id);
  await savePurchases(next);
  return NextResponse.json(next);
}
