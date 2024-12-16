'use client'

import { headers } from 'next/headers';
import React, { useState, useEffect } from 'react';



interface Item {
  id: number;
  name: string;
}



const HomePage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');


  async function getItems() {
    try {
      setLoading(true); setError('');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/items`);
      const data = await res.json(); if (!data?.data) throw new Error("Got no Items");
      setItems(data.data);
    } catch (error) {
      console.log(error); setError('Error fetching items');
    }
  }

  async function deleteItem(id: number) {
    try {
      setLoading(true); setError('');
      const options = { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/items`, options);
      const data = await res.json(); if (!data?.ok) throw new Error("Failed to delete the item");
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
    } catch (error) {
      console.log(error); setError('Error fetching items');
    }
  }

  async function createItem() {
    try {
      setLoading(true); setError('');
      const options = { method: 'POST', body: JSON.stringify({ name }), headers: { 'Content-Type': 'application/json' } };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/items`, options);
      const data = await res.json(); if (!data?.ok) throw new Error("Failed to create the item");
      setName('');
      getItems();
    } catch (error) {
      console.log(error); setError('Error fetching items');
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createItem();
  }


  useEffect(() => { getItems(); }, []); //get items on page load


  return (
    <div className='w-[100%] flex flex-col items-center gap-4 mt-20 max-w-[1000px] m-auto'>
      <h1 className='text-3xl text-center mb-20'>Docker Test Frontend</h1>

      {error && <p className='text-red-500'>{error}</p>}

      {
        items.map(item => (
          <div key={item.id} className='w-[50%] flex justify-between'>
            <h2 className='text-center'>{item.name}</h2>
            <button onClick={() => deleteItem(item.id)}>DELETE</button>
          </div>
        ))
      }

      <form onSubmit={handleSubmit} className='flex flex-col gap-2 border border-gray-200 mt-40 rounded p-10'>
        <h2 className='text-xl text-center'>Add Item</h2>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='bg-slate-100 rounded' placeholder='Enter item name' />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default HomePage