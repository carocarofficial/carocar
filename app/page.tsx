'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Car = {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  registrationYear: number;
  kmDriven: number;
  price: number;
  location: string;
  fuel: string;
  transmission?: string | null;
  bodyType?: string | null;
  media?: { url: string }[];
  ownerListing?: unknown;
  dealerInventory?: unknown;
};

const popular = [
  { label: 'SUVs', bodyType: 'SUV' },
  { label: 'Automatic', transmission: 'AUTOMATIC' },
  { label: 'Under ₹10 Lakh', maxPrice: '1000000' },
  { label: 'Petrol', fuel: 'Petrol' },
  { label: 'Electric', fuel: 'EV' },
];

const fuelLabels: Record<string, string> = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  EV: 'Electric',
  CNG: 'CNG',
  PETROL_CNG: 'Petrol + CNG',
};

const money = (n: number) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : `₹${(n / 100000).toFixed(2)} Lakh`;

function imageFor(car: Car) {
  return car.media?.[0]?.url || '';
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadCars() {
    setLoading(true);
    try {
      const r = await fetch('/api/cars');
      const data = await r.json();
      setCars(Array.isArray(data) ? data : []);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCars(); }, []);

  function search(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (location) p.set('location', location);
    if (fuel) p.set('fuel', fuel);
    if (transmission) p.set('transmission', transmission);
    if (bodyType) p.set('bodyType', bodyType);
    if (minPrice) p.set('minPrice', minPrice);
    if (maxPrice) p.set('maxPrice', maxPrice);
    window.location.href = `/buy?${p.toString()}`;
  }

  function popularSearch(item: typeof popular[number]) {
    const p = new URLSearchParams();
    if (item.bodyType) p.set('bodyType', item.bodyType);
    if (item.transmission) p.set('transmission', item.transmission);
    if (item.maxPrice) p.set('maxPrice', item.maxPrice);
    if (item.fuel) p.set('fuel', item.fuel);
    if (location) p.set('location', location);
    window.location.href = `/buy?${p.toString()}`;
  }

  const featured = useMemo(() => cars.slice(0, 6), [cars]);

  return (
    <>
      <section className="hero homeHero">
        <div className="container">
          <div className="homeEyebrow">CAROCAR · INDIA</div>
          <h1>Find a car<br />that fits your life.</h1>
          <p className="heroCopy">
            Search owner and verified-dealer cars together. Choose your city,
            budget, fuel and transmission — then compare the cars that match.
          </p>

          <form className="searchPanel" onSubmit={search}>
            <div className="locationRow">
              <span className="pin">⌖</span>
              <div>
                <small>YOUR LOCATION</small>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Mumbai, Pune, Nashik..." />
              </div>
              <span className="locationHint">Change anytime</span>
            </div>

            <div className="searchMain">
              <div className="searchField wide">
                <label>Search</label>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Brand, model or keyword" />
              </div>
              <div className="searchField">
                <label>Budget</label>
                <div className="twoInputs">
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₹" />
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₹" />
                </div>
              </div>
              <div className="searchField">
                <label>Fuel</label>
                <select value={fuel} onChange={e => setFuel(e.target.value)}>
                  <option value="">Any fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="EV">Electric</option>
                  <option value="Petrol_CNG">Petrol + CNG</option>
                </select>
              </div>
              <div className="searchField">
                <label>Transmission</label>
                <select value={transmission} onChange={e => setTransmission(e.target.value)}>
                  <option value="">Any</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div className="searchField">
                <label>Body type</label>
                <select value={bodyType} onChange={e => setBodyType(e.target.value)}>
                  <option value="">Any</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="MUV">MUV</option>
                  <option value="COUPE">Coupe</option>
                  <option value="MPV">MPV</option>
                </select>
              </div>
              <button className="btn primary searchButton">Search cars</button>
            </div>
          </form>

          <div className="popularRow">
            <span>Popular:</span>
            {popular.map(item => (
              <button key={item.label} onClick={() => popularSearch(item)}>{item.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section homeSection">
        <div className="container">
          <div className="sectionIntro">
            <div>
              <div className="eyebrow">EXPLORE CARS</div>
              <h2>Cars people are looking at</h2>
              <p className="muted">Owner-listed and verified-dealer inventory, together in one marketplace.</p>
            </div>
            <Link className="btn ghost" href="/buy">View all cars →</Link>
          </div>

          {loading ? (
            <div className="panel">Loading cars…</div>
          ) : featured.length === 0 ? (
            <div className="panel emptyState">
              <h3>No approved cars yet</h3>
              <p className="muted">Try the marketplace after approved listings are added.</p>
              <Link className="btn primary" href="/sell">List a car</Link>
            </div>
          ) : (
            <div className="cards homeCards">
              {featured.map(car => (
                <article className="card carCard" key={car.id}>
                  <div className="carPhoto">
                    {imageFor(car) ? <img src={imageFor(car)} alt={`${car.brand} ${car.model}`} /> : <span>🚘</span>}
                    <span className="photoBadge">{car.dealerInventory ? '✓ Verified dealer' : 'Owner listed'}</span>
                  </div>
                  <div className="cardbody">
                    <div className="muted small">{car.brand}</div>
                    <h3>{car.model}{car.variant ? ` ${car.variant}` : ''}</h3>
                    <div className="price">{money(car.price)}</div>
                    <div className="chips">
                      <span className="chip">{car.registrationYear}</span>
                      <span className="chip">{car.kmDriven.toLocaleString('en-IN')} km</span>
                      <span className="chip">{fuelLabels[car.fuel] || car.fuel}</span>
                      {car.transmission && <span className="chip">{car.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}</span>}
                    </div>
                    <div className="cardLocation">⌖ {car.location}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section serviceStrip">
        <div className="container">
          <div className="eyebrow">CAROCAR ECOSYSTEM</div>
          <h2>More than buying a car.</h2>
          <div className="serviceGrid">
            <Link href="/sell" className="service"><span>💰</span><b>Sell</b><p>Sell as an owner or build your dealer inventory.</p><strong>Start selling →</strong></Link>
            <Link href="/rent" className="service"><span>🔑</span><b>Rent</b><p>Self-drive or with-driver rental options.</p><strong>Explore rentals →</strong></Link>
            <Link href="/saathi" className="service"><span>🤝</span><b>Saathi</b><p>Find or offer a cost-sharing carpool ride.</p><strong>Find a ride →</strong></Link>
            <Link href="/compare" className="service"><span>⚖️</span><b>Compare</b><p>Put your shortlisted cars side by side.</p><strong>Compare cars →</strong></Link>
          </div>
        </div>
      </section>
    </>
  );
}
