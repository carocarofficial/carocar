'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Car = {
  id: string; brand: string; model: string; variant?: string | null;
  registrationYear: number; kmDriven: number; price: number; location: string;
  fuel: string; transmission?: string | null; bodyType?: string | null;
  media?: { url: string }[]; ownerListing?: unknown; dealerInventory?: unknown;
};

type Booking = { car: Car };

const fuelLabels: Record<string, string> = { PETROL:'Petrol', DIESEL:'Diesel', EV:'Electric', CNG:'CNG', PETROL_CNG:'Petrol + CNG' };
const money = (n:number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : `₹${(n/100000).toFixed(2)} Lakh`;

function BuyPage() {
  const params = useSearchParams();
  const [cars,setCars]=useState<Car[]>([]);
  const [loading,setLoading]=useState(true);
  const [msg,setMsg]=useState('');
  const [q,setQ]=useState(params.get('q')||'');
  const [location,setLocation]=useState(params.get('location')||'');
  const [fuel,setFuel]=useState(params.get('fuel')||'');
  const [transmission,setTransmission]=useState(params.get('transmission')||'');
  const [bodyType,setBodyType]=useState(params.get('bodyType')||'');
  const [minPrice,setMinPrice]=useState(params.get('minPrice')||'');
  const [maxPrice,setMaxPrice]=useState(params.get('maxPrice')||'');
  const [maxKm,setMaxKm]=useState(params.get('maxKm')||'');
  const [seller,setSeller]=useState(params.get('seller')||'');
  const [sort,setSort]=useState('newest');
  const [favIds,setFavIds]=useState<string[]>([]);
  const [compareIds,setCompareIds]=useState<string[]>([]);
  const [booking,setBooking]=useState<Booking|null>(null);
  const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [date,setDate]=useState('');
  const [bookingMsg,setBookingMsg]=useState(''); const [bookingBusy,setBookingBusy]=useState(false);

  async function load(overrides?: Record<string,string>) {
    setLoading(true); setMsg('');
    const p=new URLSearchParams();
    const values={q,location,fuel,transmission,bodyType,minPrice,maxPrice,maxKm,seller,...overrides};
    Object.entries(values).forEach(([k,v])=>{if(v)p.set(k,v)});
    try {
      const r=await fetch('/api/cars?'+p.toString(),{cache:'no-store'}); const d=await r.json();
      if(!r.ok) throw new Error(d?.error||'Unable to load cars');
      setCars(Array.isArray(d)?d:[]);
      const url=p.toString();
      window.history.replaceState({},'',url?`/buy?${url}`:'/buy');
    } catch(e:any) { setCars([]); setMsg(e?.message||'Unable to load cars right now.'); }
    finally { setLoading(false); }
  }

  useEffect(()=>{load(); Promise.all([fetch('/api/favourites'),fetch('/api/comparisons')]).then(async ([a,b])=>{
    const fa=await a.json(), cb=await b.json(); setFavIds(fa.ids||[]); setCompareIds(cb.ids||[]);
  }).catch(()=>{}); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  async function toggle(id:string,type:'fav'|'compare'){
    const endpoint=type==='fav'?'/api/favourites':'/api/comparisons';
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vehicleId:id})});
    const d=await r.json();
    if(!r.ok){setMsg(d.error||'Please log in');return}
    if(type==='fav') setFavIds(x=>d.saved?[...x,id]:x.filter(v=>v!==id));
    else setCompareIds(x=>d.added?[...x,id]:x.filter(v=>v!==id));
  }

  const sorted=useMemo(()=>[...cars].sort((a,b)=>sort==='priceAsc'?a.price-b.price:sort==='priceDesc'?b.price-a.price:sort==='km'?a.kmDriven-b.kmDriven:sort==='year'?b.registrationYear-a.registrationYear:0),[cars,sort]);

  async function submitBooking(e:React.FormEvent){
    e.preventDefault(); if(!booking)return; setBookingBusy(true); setBookingMsg('');
    try {
      const r=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vehicleId:booking.car.id,type:'TEST_DRIVE',scheduledAt:date,name,phone})});
      const d=await r.json(); if(!r.ok){setBookingMsg(d?.error||'Unable to book');return}
      setBookingMsg('Test drive request sent successfully.');
    } catch { setBookingMsg('Unable to book right now.'); } finally { setBookingBusy(false); }
  }

  function search(){ load(); }

  return <main className="section marketplacePage"><div className="container">
    <div className="marketTop">
      <div><div className="eyebrow">BUY MARKETPLACE</div><h1>Find your next car</h1><p className="muted">Search owner and verified-dealer inventory together.</p></div>
      <Link className="btn ghost" href="/compare">Compare cars ({compareIds.length})</Link>
    </div>

    <div className="buySearch">
      <div className="searchField wide"><label>Search</label><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Brand, model, variant or keyword"/></div>
      <div className="searchField"><label>Location</label><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Mumbai, Pune..."/></div>
      <div className="searchField"><label>Fuel</label><select value={fuel} onChange={e=>setFuel(e.target.value)}><option value="">Any</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="CNG">CNG</option><option value="EV">Electric</option><option value="Petrol_CNG">Petrol + CNG</option></select></div>
      <div className="searchField"><label>Transmission</label><select value={transmission} onChange={e=>setTransmission(e.target.value)}><option value="">Any</option><option value="AUTOMATIC">Automatic</option><option value="MANUAL">Manual</option></select></div>
      <div className="searchField"><label>Body type</label><select value={bodyType} onChange={e=>setBodyType(e.target.value)}><option value="">Any</option><option value="SUV">SUV</option><option value="HATCHBACK">Hatchback</option><option value="SEDAN">Sedan</option><option value="MUV">MUV</option><option value="MPV">MPV</option><option value="COUPE">Coupe</option></select></div>
      <div className="searchField"><label>Budget</label><div className="twoInputs"><input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Min ₹"/><input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Max ₹"/></div></div>
      <div className="searchField"><label>Max KM</label><input type="number" value={maxKm} onChange={e=>setMaxKm(e.target.value)} placeholder="e.g. 50000"/></div>
      <div className="searchField"><label>Seller</label><select value={seller} onChange={e=>setSeller(e.target.value)}><option value="">All sellers</option><option value="OWNER">Individual owner</option><option value="DEALER">Verified dealer</option></select></div>
      <button className="btn primary searchButton" onClick={search}>Search cars</button>
    </div>

    <div className="resultBar"><div><strong>{loading?'Finding cars…':`${sorted.length} car${sorted.length===1?'':'s'} found`}</strong>{location&&<span className="muted"> in {location}</span>}</div><div className="resultActions"><Link className="btn ghost" href="/sell">Sell your car</Link><select className="select sortSelect" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest listed</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option><option value="year">Newest registration</option><option value="km">Lowest KM</option></select></div></div>

    {msg&&<div className="notice">{msg}</div>}
    {loading?<div className="panel">Loading marketplace…</div>:sorted.length===0?<div className="panel emptyState"><h2>No cars match these filters</h2><p className="muted">Try a wider location, budget or fuel selection.</p><button className="btn ghost" onClick={()=>{setQ('');setLocation('');setFuel('');setTransmission('');setBodyType('');setMinPrice('');setMaxPrice('');setMaxKm('');setSeller('');setTimeout(()=>load({q:'',location:'',fuel:'',transmission:'',bodyType:'',minPrice:'',maxPrice:'',maxKm:'',seller:''}),0)}}>Clear filters</button></div>:
      <div className="cards marketplaceCards">{sorted.map(c=><article className="card carCard" key={c.id}>
        <div className="carPhoto">{c.media?.[0]?.url?<img src={c.media[0].url} alt={`${c.brand} ${c.model}`}/>:<span>🚘</span>}<span className="photoBadge">{c.dealerInventory?'✓ Verified dealer':'Owner listed'}</span></div>
        <div className="cardbody"><div className="muted small">{c.brand}</div><h3>{c.model}{c.variant?` ${c.variant}`:''}</h3><div className="price">{money(c.price)}</div>
          <div className="chips"><span className="chip">{c.registrationYear}</span><span className="chip">{c.kmDriven.toLocaleString('en-IN')} km</span><span className="chip">{fuelLabels[c.fuel]||c.fuel}</span>{c.transmission&&<span className="chip">{c.transmission==='AUTOMATIC'?'Automatic':'Manual'}</span>}</div>
          <div className="cardLocation">⌖ {c.location}</div>
          <div className="actions cardActions"><button className="btn ghost" onClick={()=>toggle(c.id,'compare')}>{compareIds.includes(c.id)?'✓ Compared':'Compare'}</button><button className="btn ghost" onClick={()=>toggle(c.id,'fav')}>{favIds.includes(c.id)?'♥ Saved':'♡ Save'}</button></div>
          <button className="btn primary fullButton" onClick={()=>{setBooking({car:c});setBookingMsg('');setDate('')}}>Book a test drive</button>
        </div>
      </article>)}</div>}

    {booking&&<div className="modalBackdrop" onClick={()=>setBooking(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="pageHead"><div><div className="eyebrow">TEST DRIVE</div><h2>{booking.car.brand} {booking.car.model}</h2><p className="muted">Choose a convenient time to experience this car.</p></div><button className="btn ghost" onClick={()=>setBooking(null)}>Close</button></div><form className="form" onSubmit={submitBooking}><div className="grid2"><label>Name<input className="input" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Phone<input className="input" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile number"/></label></div><label>Date & time<input className="input" required type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/></label>{bookingMsg&&<div className="notice">{bookingMsg}</div>}<button className="btn primary" disabled={bookingBusy}>{bookingBusy?'Sending…':'Request test drive'}</button></form></div></div>}
  </div></main>
}


export default function Buy() {
  return <Suspense fallback={<main className="section"><div className="container"><div className="panel">Loading marketplace…</div></div></main>}><BuyPage /></Suspense>;
}
