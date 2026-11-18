'use client';

import { useState, useEffect, FormEvent } from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: string | number;
  description: string;
}

export default function RestaurantMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) return;

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          description,
        }),
      });

      if (response.ok) {
        setName('');
        setPrice('');
        setDescription('');
        fetchMenu();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMenu();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-orange-600">Spice & Bite Restaurant</h1>
          <p className="text-gray-600 mt-2">Dynamic Menu Powered by Next.js & NeonDB</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Menu Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Karahi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Short menu description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md text-black"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 transition cursor-pointer"
            >
              Add Menu Item
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Menu Items</h2>
          {loading ? (
            <p className="text-gray-500">Loading menu...</p>
          ) : menuItems.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow">No menu items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between border-l-4 border-orange-500"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                      <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">
                        Rs. {item.price}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

