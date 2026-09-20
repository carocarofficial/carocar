import { db } from './db';
export async function assertRentalAvailability(rentalId:string,startAt:Date,endAt:Date){
 if(startAt>=endAt) throw new Error('End time must be after start time');
 const rental=await db.rentalListing.findUnique({where:{id:rentalId}}); if(!rental||!rental.active) throw new Error('Rental listing is not available');
 const overlap=await db.rentalBooking.findFirst({where:{rentalId,status:{in:['PENDING','CONFIRMED']},startAt:{lt:endAt},endAt:{gt:startAt}}});
 if(overlap) throw new Error('Vehicle is already booked for the requested period');
 const blocked=await db.rentalAvailability.findFirst({where:{rentalId,available:false,startAt:{lt:endAt},endAt:{gt:startAt}}});
 if(blocked) throw new Error('Vehicle is unavailable for the requested period');
}
export async function createRentalBooking(input:{rentalId:string;userId:string;startAt:Date;endAt:Date}){
 if(input.startAt>=input.endAt) throw new Error('End time must be after start time');
 return db.$transaction(async tx=>{
  const rental=await tx.rentalListing.findUnique({where:{id:input.rentalId}}); if(!rental||!rental.active) throw new Error('Rental listing is not available');
  const overlap=await tx.rentalBooking.findFirst({where:{rentalId:input.rentalId,status:{in:['PENDING','CONFIRMED']},startAt:{lt:input.endAt},endAt:{gt:input.startAt}}}); if(overlap) throw new Error('Vehicle is already booked for the requested period');
  const blocked=await tx.rentalAvailability.findFirst({where:{rentalId:input.rentalId,available:false,startAt:{lt:input.endAt},endAt:{gt:input.startAt}}}); if(blocked) throw new Error('Vehicle is unavailable for the requested period');
  const ms=input.endAt.getTime()-input.startAt.getTime(); const hours=Math.max(1,Math.ceil(ms/3600000)); const days=Math.max(1,Math.ceil(hours/24)); const totalPrice=Math.min(days*rental.dailyRate,hours*rental.hourlyRate || days*rental.dailyRate);
  return tx.rentalBooking.create({data:{rentalId:input.rentalId,userId:input.userId,startAt:input.startAt,endAt:input.endAt,totalPrice,status:'CONFIRMED'},include:{rental:{include:{vehicle:true}}}});
 });
}
