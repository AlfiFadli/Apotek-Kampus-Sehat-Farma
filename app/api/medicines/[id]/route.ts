import { NextResponse } from 'next/server';
import { deleteMedicine } from '@/lib/store';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const medicines = await deleteMedicine(params.id);
  return NextResponse.json(medicines);
}
