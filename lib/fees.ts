import { db } from './db';
export async function calculateFee(service:string, amount:number){
 const cfg=await db.platformFee.findUnique({where:{service}});
 if(!cfg||!cfg.enabled)return 0;
 let fee=Math.round(amount*Number(cfg.percentage)/100)+cfg.fixedFee;
 if(cfg.minimumFee!=null) fee=Math.max(fee,cfg.minimumFee);
 if(cfg.maximumFee!=null) fee=Math.min(fee,cfg.maximumFee);
 return fee;
}
