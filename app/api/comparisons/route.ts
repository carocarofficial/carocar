import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ids: [], cars: [] });
  const rows = await db.comparison.findMany({
    where: { userId: user.id },
    include: { vehicle: { include: { media: { where: { isPrimary: true }, take: 1 }, ownerListing: true, dealerInventory: { include: { dealer: true } } } } },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json({ ids: rows.map(r => r.vehicleId), cars: rows.map(r => r.vehicle) });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { vehicleId } = z.object({ vehicleId: z.string() }).parse(await req.json());
    const existing = await db.comparison.findUnique({ where: { userId_vehicleId: { userId: user.id, vehicleId } } });
    if (existing) {
      await db.comparison.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false });
    }
    const count = await db.comparison.count({ where: { userId: user.id } });
    if (count >= 4) return NextResponse.json({ error: 'Compare up to 4 cars' }, { status: 400 });
    await db.comparison.create({ data: { userId: user.id, vehicleId } });
    return NextResponse.json({ added: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unable to update comparison' }, { status: 400 });
  }
}
