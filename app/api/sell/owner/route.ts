import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  brand:z.string().min(1), model:z.string().min(1), variant:z.string().optional(), registrationYear:z.coerce.number().int().min(1900).max(new Date().getFullYear()+1), registrationNumber:z.string().optional(), owners:z.coerce.number().int().min(1).default(1),
  fuel:z.enum(['PETROL','DIESEL','EV','CNG','PETROL_CNG']), kmDriven:z.coerce.number().int().min(0), colour:z.string().optional(), location:z.string().min(1), price:z.coerce.number().int().nonnegative(), transmission:z.string().optional(), bodyType:z.string().optional(), description:z.string().optional(), condition:z.string().optional(), accidentHistory:z.string().optional(), serviceHistory:z.string().optional(), insuranceInfo:z.string().optional(), rcInfo:z.string().optional(), features:z.any().optional(), negotiable:z.boolean().default(true), mediaUrls:z.array(z.object({url:z.string().url(),type:z.string().default('image'),isPrimary:z.boolean().optional()})).default([])
});

export async function GET(){
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:'Login required'},{status:401});
  const listings=await db.ownerListing.findMany({where:{sellerId:user.id},include:{vehicle:{include:{media:true}}},orderBy:{vehicle:{createdAt:'desc'}}});
  return NextResponse.json(listings);
}
export async function POST(req:Request){
  try{
    const user=await getCurrentUser(); if(!user)return NextResponse.json({error:'Login required'},{status:401});
    const input=schema.parse(await req.json());
    const vehicle=await db.vehicle.create({data:{brand:input.brand,model:input.model,variant:input.variant||null,registrationYear:input.registrationYear,registrationNumber:input.registrationNumber||null,owners:input.owners,fuel:input.fuel,kmDriven:input.kmDriven,colour:input.colour||null,location:input.location,price:input.price,transmission:input.transmission||null,bodyType:input.bodyType||null,description:input.description||null,condition:input.condition||null,accidentHistory:input.accidentHistory||null,serviceHistory:input.serviceHistory||null,insuranceInfo:input.insuranceInfo||null,rcInfo:input.rcInfo||null,features:input.features||null,media:{create:input.mediaUrls.map((m,i)=>({url:m.url,type:m.type,isPrimary:m.isPrimary??i===0,sortOrder:i}))},ownerListing:{create:{sellerId:user.id,status:'APPROVED',negotiable:input.negotiable}}},include:{ownerListing:true,media:true}});
    return NextResponse.json({vehicle,message:'Listing submitted for review.'},{status:201});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid listing'},{status:400});}
}
