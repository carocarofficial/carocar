import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const appointments = await db.appointment.findMany({ where: { userId: user.id }, include: { vehicle: true }, orderBy: { scheduledAt: 'asc' } });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Please log in to book.' }, { status: 401 });
    const body = await req.json();
    const { vehicleId, type, scheduledAt, name, phone, notes } = body || {};
    if (!vehicleId || !['APPOINTMENT', 'TEST_DRIVE'].includes(type) || !scheduledAt || !name?.trim() || !phone?.trim()) return NextResponse.json({ error: 'Please fill all required booking details.' }, { status: 400 });
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return NextResponse.json({ error: 'Please choose a future date and time.' }, { status: 400 });
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return NextResponse.json({ error: 'Car not found.' }, { status: 404 });
    const booking = await db.appointment.create({ data: { userId: user.id, vehicleId, type, scheduledAt: date, name: name.trim(), phone: phone.trim(), notes: notes?.trim() || null }, include: { vehicle: true } });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments failed:', error);
    return NextResponse.json({ error: 'Unable to book right now.' }, { status: 500 });
  }
}
