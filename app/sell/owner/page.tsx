'use client';

import { useState } from 'react';

export default function OwnerSell() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const formElement = e.currentTarget; const form = new FormData(formElement);

    const data = {
      brand: String(form.get('brand') || ''),
      model: String(form.get('model') || ''),
      variant: String(form.get('variant') || ''),
      registrationYear: Number(form.get('registrationYear') || 0),
      registrationNumber: String(form.get('registrationNumber') || ''),
      owners: Number(form.get('owners') || 1),
      kmDriven: Number(form.get('kmDriven') || 0),
      colour: String(form.get('colour') || ''),
      location: String(form.get('location') || ''),
      price: Number(form.get('price') || 0),
      fuel: String(form.get('fuel') || 'PETROL').toUpperCase(),
      condition: String(form.get('condition') || ''),
      accidentHistory: String(form.get('accidentHistory') || ''),
      serviceHistory: String(form.get('serviceHistory') || ''),
      insuranceInfo: String(form.get('insuranceInfo') || ''),
      rcInfo: String(form.get('insuranceInfo') || ''),
      features: String(form.get('features') || ''),
      negotiable: form.get('priceType') === 'Negotiable',
      mediaUrls: []
    };

    try {
      const response = await fetch('/api/sell/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not submit listing');
      }

      setMessage('Your car has been submitted for review.');
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container">
        <h1>List your car</h1>
        <p className="muted">
          Listings should be moderated before public visibility where applicable.
        </p>

        <form className="panel form" onSubmit={handleSubmit}>
          <div className="grid2">
            {[
              ['Brand', 'brand', 'text'],
              ['Model', 'model', 'text'],
              ['Variant', 'variant', 'text'],
              ['Registration year', 'registrationYear', 'number'],
              ['Registration number', 'registrationNumber', 'text'],
              ['Number of owners', 'owners', 'number'],
              ['KM driven', 'kmDriven', 'number'],
              ['Colour', 'colour', 'text'],
              ['Location', 'location', 'text'],
              ['Asking price (₹)', 'price', 'number']
            ].map(([label, name, type]) => (
              <label key={name}>
                {label}
                <input
                  className="input"
                  name={name}
                  type={type}
                  required={['brand', 'model', 'registrationYear', 'kmDriven', 'location', 'price'].includes(name)}
                />
              </label>
            ))}

            <label>
              Fuel
              <select className="select" name="fuel">
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="EV">EV</option>
                <option value="CNG">CNG</option>
              </select>
            </label>

            <label>
              Price type
              <select className="select" name="priceType">
                <option value="Negotiable">Negotiable</option>
                <option value="Fixed">Fixed</option>
              </select>
            </label>
          </div>

          <label>
            Vehicle condition
            <textarea className="input" name="condition" rows={3} />
          </label>

          <label>
            Accident history
            <textarea className="input" name="accidentHistory" rows={3} />
          </label>

          <label>
            Service history
            <textarea className="input" name="serviceHistory" rows={3} />
          </label>

          <label>
            Insurance / RC information
            <textarea className="input" name="insuranceInfo" rows={3} />
          </label>

          <label>
            Features & additional information
            <textarea className="input" name="features" rows={3} />
          </label>

          <label>
            Photos / videos
            <input
              className="input"
              type="file"
              multiple
              accept="image/*,video/*"
            />
          </label>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for review'}
          </button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </main>
  );
}
