import { NextResponse } from 'next/server';
import { createHash, randomInt } from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: Request){
  const {phone,purpose='LOGIN'}=await req.json();
  if(!phone) return NextResponse.json({error:'Phone is required'},{status:400});
  const code=String(randomInt(100000,999999));
  const hash=createHash('sha256').update(code).digest('hex');
  await db.otpCode.create({data:{phone:String(phone),purpose,codeHash:hash,expiresAt:new Date(Date.now()+5*60*1000)}});
  // SMS provider hook: set OTP_PROVIDER and provider credentials in production. Local mode returns the code for testing.
  const response:any={ok:true,message:'OTP created'};
  if(process.env.NODE_ENV!=='production' || process.env.OTP_RETURN_CODE==='true') response.devCode=code;
  return NextResponse.json(response);
}
