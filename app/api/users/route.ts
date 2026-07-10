import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/store';

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const users = await getUsers();
  const next = [...users, payload];
  await saveUsers(next);
  return NextResponse.json(next);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const users = await getUsers();
  const next = users.map((item) => (item.id === payload.id ? payload : item));
  await saveUsers(next);
  return NextResponse.json(next);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const users = await getUsers();
  const next = users.filter((item) => item.id !== id);
  await saveUsers(next);
  return NextResponse.json(next);
}
