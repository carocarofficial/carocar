import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
export async function POST(req:Request){
 const user=await getCurrentUser(); if(!user) return NextResponse.json({error:'Login required'},{status:401});
 const {service,amount,referenceType,referenceId,metadata}=await req.json();
 if(!service||!Number.isInteger(Number(amount))||Number(amount)<=0) return NextResponse.json({error:'Valid service and amount are required'},{status:400});
 const useRazor=!!process.env.RAZORPAY_KEY_ID&&!!process.env.RAZORPAY_KEY_SECRET;
 let provider='MOCK',orderId=`mock_${randomBytes(10).toString('hex')}`;
 if(useRazor){
   const auth=Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
   const r=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify({amount:Number(amount)*100,currency:'INR',receipt:`carocar_${Date.now()}`,notes:{service,referenceId:referenceId||''}})});
   if(!r.ok) return NextResponse.json({error:'Payment provider order creation failed'},{status:502}); const data:any=await r.json(); provider='RAZORPAY'; orderId=data.id;
 }
 const payment=await db.payment.create({data:{userId:user.id,service,referenceType,referenceId,provider,providerOrderId:orderId,amount:Number(amount),metadata}});
 return NextResponse.json({ok:true,payment,checkout:provider==='RAZORPAY'?{keyId:process.env.RAZORPAY_KEY_ID,orderId,amount:Number(amount)*100,currency:'INR'}:{mode:'MOCK',orderId,amount:Number(amount),message:'Demo payment mode: use /api/payments/verify to complete testing'}});
}
