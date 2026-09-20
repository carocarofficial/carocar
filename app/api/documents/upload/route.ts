import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req:Request){
 const user=await getCurrentUser(); if(!user) return NextResponse.json({error:'Login required'},{status:401});
 const form=await req.formData(); const file=form.get('file'); const type=String(form.get('type')||'OTHER');
 if(!(file instanceof File)) return NextResponse.json({error:'File is required'},{status:400});
 if(file.size>10*1024*1024) return NextResponse.json({error:'Maximum file size is 10MB'},{status:400});
 const allowed=['image/jpeg','image/png','application/pdf']; if(!allowed.includes(file.type)) return NextResponse.json({error:'Only JPG, PNG and PDF files are allowed'},{status:400});
 const dir=path.join(process.cwd(),'public','uploads',user.id); await fs.mkdir(dir,{recursive:true});
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_'); const key=`${Date.now()}-${safe}`; await fs.writeFile(path.join(dir,key),Buffer.from(await file.arrayBuffer()));
 const doc=await db.userDocument.create({data:{userId:user.id,type,storageKey:`/uploads/${user.id}/${key}`,fileName:file.name,mimeType:file.type}});
 return NextResponse.json({ok:true,document:doc});
}
