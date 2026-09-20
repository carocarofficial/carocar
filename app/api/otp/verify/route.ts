import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { makeSession, COOKIE } from '@/lib/auth';
export async function POST(req:Request){
  const {phone,code,purpose='LOGIN'}=await req.json();
  if(!phone||!code) return NextResponse.json({error:'Phone and OTP are required'},{status:400});
  const otp=await db.otpCode.findFirst({where:{phone:String(phone),purpose,verifiedAt:null,expiresAt:{gt:new Date()}},orderBy:{createdAt:'desc'}});
  if(!otp) return NextResponse.json({error:'OTP expired or not found'},{status:400});
  if(otp.attempts>=5) return NextResponse.json({error:'Too many attempts'},{status:429});
  const hash=createHash('sha256').update(String(code)).digest('hex');
  if(hash!==otp.codeHash){await db.otpCode.update({where:{id:otp.id},data:{attempts:{increment:1}}});return NextResponse.json({error:'Invalid OTP'},{status:400});}
  let user=otp.userId?await db.user.findUnique({where:{id:otp.userId}}):await db.user.findUnique({where:{phone:String(phone)}});
  if(!user) user=await db.user.create({data:{phone:String(phone),email:"phone-"+createHash("sha256").update(String(phone)).digest("hex").slice(0,24)+"@carocar.local"}});
  await db.otpCode.update({where:{id:otp.id},data:{verifiedAt:new Date(),userId:user.id}});
  const res=NextResponse.json({ok:true,user:{id:user.id,phone:user.phone}}); res.cookies.set(COOKIE,makeSession(user.id),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*30}); return res;
}
