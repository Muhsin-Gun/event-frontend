// src/Components/Payment.js
import React, { useState } from 'react';

export default function Payment() {
  const [amount, setAmount] = useState('');

  const handlePayment = (e) => {
    e.preventDefault();
    alert(`Payment of KES ${amount} processed (stub).`);
    setAmount('');
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Payment</h2>
        <form onSubmit={handlePayment}>
          <div className="form-row">
            <label>
              Amount
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            </label>
          </div>
          <button type="submit" className="btn">Pay with M-Pesa</button>
        </form>
      </div>
    </section>
  );
}
