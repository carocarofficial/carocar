import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

const COOKIE = 'carocar_session';
const secret = () => process.env.AUTH_SECRET || 'local-only-secret';
export function hashPassword(password:string){ const salt=randomBytes(16).toString('hex'); const hash=scryptSync(password,salt,64).toString('hex'); return `${salt}:${hash}`; }
export function verifyPassword(password:string, stored:string){ const [salt,hash]=stored.split(':'); if(!salt||!hash)return false; const actual=scryptSync(password,salt,64); const expected=Buffer.from(hash,'hex'); return expected.length===actual.length && timingSafeEqual(actual,expected); }
function sign(value:string){return createHmac('sha256',secret()).update(value).digest('hex');}
export function makeSession(userId:string){return `${userId}.${sign(userId)}`;}
export function readSession(token:string){const [id,sig]=token.split('.'); if(!id||!sig)return null; const expected=sign(id); return sig.length===expected.length && timingSafeEqual(Buffer.from(sig),Buffer.from(expected))?id:null;}
export async function getCurrentUser(){const jar=await cookies(); const token=jar.get(COOKIE)?.value; const id=token?readSession(token):null; return id?db.user.findUnique({where:{id},include:{profile:true,dealer:true}}):null;}
export { COOKIE };
