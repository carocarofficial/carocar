import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function Account(){
  const user=await getCurrentUser();
  if(!user)return <main className="section"><div className="container"><div className="panel authCard"><h1>Account</h1><p className="muted">Log in to access your dashboard.</p><Link className="btn primary" href="/login">Log in / Sign up</Link></div></div></main>;

  const [saved, compared, appointments] = await Promise.all([
    db.favourite.findMany({where:{userId:user.id},include:{vehicle:true},orderBy:{id:'desc'}}),
    db.comparison.findMany({where:{userId:user.id},include:{vehicle:true},orderBy:{id:'asc'}}),
    db.appointment.findMany({where:{userId:user.id},include:{vehicle:true},orderBy:{scheduledAt:'asc'}}),
  ]);

  return <main className="dash"><aside className="side"><h2>carOcar</h2><div className="userMini">{user.profile?.name||user.email}<small>{user.role}</small></div>
    <a href="#profile">Profile</a><a href="#saved">Saved cars ({saved.length})</a><a href="#compared">Compared cars ({compared.length})</a><a href="#appointments">Appointments ({appointments.length})</a>
    {['Buy enquiries','My listings','Rental bookings','Saathi rides','Notifications','Reviews','Settings'].map(x=><a href="#" key={x}>{x}</a>)}
    <form action="/api/auth/logout" method="post"><button className="sideLogout">Log out</button></form></aside>
    <section className="main" id="profile"><div className="eyebrow">ACCOUNT</div><h1>Hello, {user.profile?.name||'there'}.</h1>
      <div className="statgrid"><div className="stat"><span className="muted">Role</span><strong>{user.role}</strong></div><div className="stat"><span className="muted">City</span><strong>{user.profile?.city||'—'}</strong></div><div className="stat"><span className="muted">Saved cars</span><strong>{saved.length}</strong></div><div className="stat"><span className="muted">Compared cars</span><strong>{compared.length}</strong></div></div>
      <div className="panel" id="saved" style={{marginTop:20}}><div className="pageHead"><div><h2>Saved cars</h2><p className="muted">Cars you saved with the heart button.</p></div><Link className="btn ghost" href="/buy">Browse cars</Link></div>
        {saved.length===0?<p className="muted">No saved cars yet. Go to BUY and press ♡ Save.</p>:<div className="cards">{saved.map(({vehicle:c})=><article className="card" key={c.id}><div className="carImg">🚘</div><div className="cardbody"><div className="muted small">{c.brand}</div><h3>{c.model}</h3><div className="price">₹{(c.price/100000).toFixed(2)} Lakh</div><div className="chips"><span className="chip">{c.registrationYear}</span><span className="chip">{c.kmDriven.toLocaleString('en-IN')} km</span><span className="chip">{c.location}</span><span className="chip">{c.fuel.replace('_',' + ')}</span></div></div></article>)}</div>}
      </div>
      <div className="panel" id="compared" style={{marginTop:20}}><div className="pageHead"><div><h2>Compared cars</h2><p className="muted">Cars currently selected for comparison.</p></div><Link className="btn ghost" href="/compare">Open comparison</Link></div>
        {compared.length===0?<p className="muted">No compared cars yet. Go to BUY and press Compare.</p>:<div className="cards">{compared.map(({vehicle:c})=><article className="card" key={c.id}><div className="carImg">🚘</div><div className="cardbody"><div className="muted small">{c.brand}</div><h3>{c.model}</h3><div className="price">₹{(c.price/100000).toFixed(2)} Lakh</div><div className="chips"><span className="chip">{c.registrationYear}</span><span className="chip">{c.kmDriven.toLocaleString('en-IN')} km</span><span className="chip">{c.location}</span><span className="chip">{c.fuel.replace('_',' + ')}</span></div></div></article>)}</div>}
      </div>
      <div className="panel" id="appointments" style={{marginTop:20}}><div className="pageHead"><div><h2>Appointments & test drives</h2><p className="muted">Your upcoming requests from the BUY marketplace.</p></div><Link className="btn ghost" href="/buy">Book another</Link></div>
        {appointments.length===0?<p className="muted">No appointments yet. Open BUY and choose Book Test Drive or Book Appointment.</p>:<div className="form">{appointments.map(a=><div className="panel" key={a.id}><strong>{a.type==='TEST_DRIVE'?'Test Drive':'Appointment'} · {a.vehicle.brand} {a.vehicle.model}</strong><div className="chips"><span className="chip">{new Date(a.scheduledAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</span><span className="chip">{a.status}</span><span className="chip">{a.vehicle.location}</span></div></div>)}</div>}
      </div>
      <div className="panel" style={{marginTop:20}}><h2>Your carOcar workspace</h2><p className="muted">Manage listings, favourites, comparisons, rental bookings and Saathi rides from one account.</p><div className="actions"><Link className="btn primary" href="/buy">Browse cars</Link><Link className="btn ghost" href="/sell">Sell a car</Link><Link className="btn ghost" href="/rent">Rent a car</Link></div></div>
    </section></main>
}
