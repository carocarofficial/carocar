import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
export async function POST(req:Request){
 const user=await getCurrentUser(); if(!user) return NextResponse.json({error:'Login required'},{status:401});
 const {orderId,paymentId,signature}=await req.json(); const p=await db.payment.findFirst({where:{providerOrderId:orderId,userId:user.id}}); if(!p) return NextResponse.json({error:'Payment not found'},{status:404});
 if(p.provider==='RAZORPAY') { const expected=createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(`${orderId}|${paymentId}`).digest('hex'); if(expected!==signature)return NextResponse.json({error:'Invalid payment signature'},{status:400}); }
 const updated=await db.payment.update({where:{id:p.id},data:{providerPaymentId:paymentId||`mock_pay_${Date.now()}`,signature:signature||'mock',status:'PAID'}});
 await db.transaction.create({data:{userId:user.id,service:p.service,amount:p.amount,fee:0,currency:p.currency,status:'PAID'}});
 return NextResponse.json({ok:true,payment:updated});
}
