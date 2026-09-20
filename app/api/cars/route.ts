import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Fuel } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get('q')?.trim();
    const fuelParam = u.searchParams.get('fuel')?.trim();
    const location = u.searchParams.get('location')?.trim();
    const transmission = u.searchParams.get('transmission')?.trim();
    const bodyType = u.searchParams.get('bodyType')?.trim();
    const minPrice = Number(u.searchParams.get('minPrice') || 0);
    const maxPrice = Number(u.searchParams.get('maxPrice') || 0);
    const maxKm = Number(u.searchParams.get('maxKm') || 0);
    const seller = u.searchParams.get('seller')?.trim();

    const fuelMap: Record<string, Fuel> = {
      Petrol: Fuel.PETROL,
      Diesel: Fuel.DIESEL,
      EV: Fuel.EV,
      CNG: Fuel.CNG,
      Petrol_CNG: Fuel.PETROL_CNG,
    };
    const fuel = fuelParam ? fuelMap[fuelParam] : undefined;

    const cars = await db.vehicle.findMany({
      where: {
        OR: [
          { ownerListing: { is: { status: 'APPROVED' } } },
          { dealerInventory: { is: { status: 'APPROVED' } } },
        ],
        ...(fuel ? { fuel } : {}),
        ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
        ...(transmission ? { transmission } : {}),
        ...(bodyType ? { bodyType } : {}),
        ...(minPrice > 0 || maxPrice > 0
          ? { price: { ...(minPrice > 0 ? { gte: minPrice } : {}), ...(maxPrice > 0 ? { lte: maxPrice } : {}) } }
          : {}),
        ...(maxKm > 0 ? { kmDriven: { lte: maxKm } } : {}),
        ...(seller === 'OWNER' ? { ownerListing: { is: { status: 'APPROVED' } } } : {}),
        ...(seller === 'DEALER' ? { dealerInventory: { is: { status: 'APPROVED' } } } : {}),
        ...(q
          ? {
              AND: [{
                OR: [
                  { brand: { contains: q, mode: 'insensitive' } },
                  { model: { contains: q, mode: 'insensitive' } },
                  { variant: { contains: q, mode: 'insensitive' } },
                  { location: { contains: q, mode: 'insensitive' } },
                ],
              }],
            }
          : {}),
      },
      include: {
        media: { where: { isPrimary: true }, take: 1 },
        ownerListing: { include: { seller: { include: { profile: true } } } },
        dealerInventory: { include: { dealer: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('GET /api/cars failed:', error);
    return NextResponse.json({ error: 'Unable to load cars right now.' }, { status: 500 });
  }
}
