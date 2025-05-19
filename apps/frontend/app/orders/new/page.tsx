'use client';
import { useState } from 'react';

export default function NewOrder() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), description }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-2 max-w-xs">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2"
          required
        />
        <button type="submit" className="border p-2">Create Order</button>
      </form>
      {result && (
        <div className="mt-4">
          <p>Order ID: {result.id}</p>
          <p>Status: {result.status}</p>
        </div>
      )}
    </div>
  );
}
