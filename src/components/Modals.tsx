"use client";

import React from "react";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  editingId: number | null;
  name: string;
  setName: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function AdminModal({
  open, onClose, editingId, name, setName, price, setPrice,
  description, setDescription, onSubmit, saving,
}: AdminModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#111115] border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-amber-400">
            {editingId ? "Edit Menu Dish" : "Add New Dish"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl cursor-pointer">
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Dish Name (e.g. Chicken Karahi)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white focus:border-amber-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Price in PKR (e.g. 1450)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white focus:border-amber-400 focus:outline-none"
          />
          <textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold cursor-pointer"
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "+ Publish Dish"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: { item: MenuItem; qty: number }[];
  onRemove: (id: number) => void;
  onOrder: () => void;
  orderPlaced: boolean;
}

export function CartDrawer({ open, onClose, cart, onRemove, onOrder, orderPlaced }: CartDrawerProps) {
  if (!open) return null;
  const total = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#111115] border-l border-white/10 p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold text-amber-400">Your Order Bag</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl cursor-pointer">
              ✕
            </button>
          </div>
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm mt-10 text-center">Your bag is empty.</p>
          ) : (
            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="font-bold text-sm">{c.item.name}</p>
                    <p className="text-xs text-amber-400">Rs. {c.item.price} × {c.qty}</p>
                  </div>
                  <button onClick={() => onRemove(c.item.id)} className="text-xs text-red-400 cursor-pointer">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between font-extrabold text-lg">
              <span>Total Bill</span>
              <span className="text-amber-400">Rs. {total}</span>
            </div>
            <button onClick={onOrder} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold cursor-pointer">
              Place Order Now
            </button>
            {orderPlaced && <p className="text-center text-emerald-400 text-xs font-bold">✓ Order sent to kitchen!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

