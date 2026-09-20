import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db } from '@/lib/db';
export async function POST(req:Request){
 const body=await req.text(); const sig=req.headers.get('x-razorpay-signature')||''; if(process.env.RAZORPAY_WEBHOOK_SECRET){const expected=createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex'); if(expected!==sig)return NextResponse.json({error:'Invalid signature'},{status:400});}
 const event:any=JSON.parse(body); const entity=event?.payload?.payment?.entity; if(entity?.order_id){await db.payment.updateMany({where:{providerOrderId:entity.order_id},data:{providerPaymentId:entity.id,status:entity.status==='captured'?'PAID':'FAILED',signature:sig}});}
 return NextResponse.json({ok:true});
}
