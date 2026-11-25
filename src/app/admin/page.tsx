"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface Booking {
  id: number;
  customer_name: string;
  phone: string;
  guests: number;
  booking_date: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Add New Dish States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit Dish States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // Change Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadData = async () => {
    const [mRes, bRes] = await Promise.all([fetch("/api/menu"), fetch("/api/bookings")]);
    const mData = await mRes.json();
    const bData = await bRes.json();
    if (Array.isArray(mData)) setItems(mData);
    if (Array.isArray(bData)) setBookings(bData);
  };

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) {
          router.replace("/login");
        } else {
          setChecking(false);
          loadData();
        }
      });
  }, [router]);

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price), description }),
      });
      if (res.ok) {
        setName("");
        setPrice("");
        setDescription("");
        loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditDescription("");
  };

  const handleUpdateDish = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName,
          price: Number(editPrice),
          description: editDescription,
        }),
      });
      if (res.ok) {
        cancelEdit();
        loadData();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setOldPassword("");
      setNewPassword("");
      setPassMsg({ type: "ok", text: "Password updated! Use new password next login." });
    } else {
      setPassMsg({ type: "err", text: data.error || "Failed to update password" });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#08080a] text-amber-400 flex items-center justify-center font-bold">
        Verifying Admin Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100">
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black">
              S
            </span>
            <span className="font-extrabold text-amber-400">SPICE &amp; BITE • ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold">
              View Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white/[0.04] border border-amber-500/30 p-7 animate-fade-up">
            <h2 className="text-xl font-extrabold text-amber-400 mb-4">+ Add New Menu Dish</h2>
            <form onSubmit={handleAddDish} className="space-y-4">
              <input
                type="text"
                placeholder="Dish Name (e.g. Chicken Biryani)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
              />
              <input
                type="number"
                placeholder="Price in PKR (e.g. 650)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
              />
              <textarea
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-sm cursor-pointer"
              >
                {saving ? "Saving to NeonDB..." : "Publish Dish to Public Menu"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-7 animate-fade-up">
            <h2 className="text-xl font-extrabold text-white mb-1">Security: Change Password</h2>
            <p className="text-xs text-gray-400 mb-4">
              Update admin password live in NeonDB without editing .env.
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 cursor-pointer"
                >
                  {showOld ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="New Password (min 4 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 cursor-pointer"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black text-white font-bold text-sm transition cursor-pointer"
              >
                Update Admin Password
              </button>
              {passMsg && (
                <p className={`text-xs font-semibold text-center ${passMsg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                  {passMsg.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Table Bookings Section */}
        <div className="rounded-3xl bg-white/[0.04] border border-emerald-500/30 p-7">
          <h2 className="text-xl font-extrabold text-emerald-400 mb-5">
            Table Reservations ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-400">Abhi tak koi table book nahi hui.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-white">{b.customer_name}</p>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      {b.guests} Guests
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 font-semibold">{b.booking_date}</p>
                  <p className="text-xs text-gray-400">Phone: {b.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Menu Dishes (With Edit & Delete) */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-7">
          <h2 className="text-xl font-extrabold mb-5">Manage Menu Dishes ({items.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-black/50 border border-white/10">
                {editingId === item.id ? (
                  <form onSubmit={(e) => handleUpdateDish(e, item.id)} className="space-y-2.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-black/80 border border-amber-500/50 text-xs text-white"
                      placeholder="Dish Name"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-black/80 border border-amber-500/50 text-xs text-white"
                      placeholder="Price (PKR)"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-black/80 border border-amber-500/50 text-xs text-white"
                      placeholder="Description"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold cursor-pointer"
                      >
                        {updating ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-xs text-amber-400 font-semibold">Rs. {item.price}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

