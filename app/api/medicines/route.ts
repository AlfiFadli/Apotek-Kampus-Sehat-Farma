import { NextResponse } from 'next/server';
import { getMedicines, saveMedicines } from '@/lib/store';

export async function GET() {
  const medicines = await getMedicines();
  return NextResponse.json(medicines);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const medicines = await getMedicines();
  const next = [...medicines, payload];
  await saveMedicines(next);
  return NextResponse.json(next);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const medicines = await getMedicines();
  const next = medicines.map((item) => (item.id === payload.id ? payload : item));
  await saveMedicines(next);
  return NextResponse.json(next);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const medicines = await getMedicines();
  const next = medicines.filter((item) => item.id !== id);
  await saveMedicines(next);
  return NextResponse.json(next);
}
