import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ids: [] });
  const rows = await db.favourite.findMany({ where: { userId: user.id }, select: { vehicleId: true } });
  return NextResponse.json({ ids: rows.map(r => r.vehicleId) });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { vehicleId } = z.object({ vehicleId: z.string() }).parse(await req.json());
    const existing = await db.favourite.findUnique({ where: { userId_vehicleId: { userId: user.id, vehicleId } } });
    if (existing) {
      await db.favourite.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }
    await db.favourite.create({ data: { userId: user.id, vehicleId } });
    return NextResponse.json({ saved: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unable to save favourite' }, { status: 400 });
  }
}
