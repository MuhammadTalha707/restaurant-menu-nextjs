"use client";

import { useState, useEffect } from "react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

const IMAGES = [
  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
];

const getDishImage = (name: string, index: number) => {
  const n = name.toLowerCase();
  if (n.includes("biryani") || n.includes("rice")) return IMAGES[1];
  if (n.includes("burger") || n.includes("zinger")) return IMAGES[2];
  if (n.includes("kabab") || n.includes("boti") || n.includes("tikka")) return IMAGES[3];
  if (n.includes("karahi") || n.includes("chicken")) return IMAGES[0];
  return IMAGES[index % IMAGES.length];
};

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (Array.isArray(data)) setMenuItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/menu", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, price: Number(price), description }),
      });
      if (res.ok) {
        setName("");
        setPrice("");
        setDescription("");
        setEditingId(null);
        fetchMenu();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setDescription(item.description || "");
    document.getElementById("form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) setEditingId(null);
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filtered = menuItems.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 relative overflow-x-hidden">
      {/* Page Opening Intro Animation */}
      <div
        className={`fixed inset-0 z-50 bg-[#070709] flex flex-col items-center justify-center transition-all duration-700 pointer-events-none ${
          showIntro ? "opacity-100" : "opacity-0 scale-105"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-3xl animate-bounce">
          S
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-[0.25em] text-amber-400">
          SPICE &amp; BITE
        </h2>
      </div>

      {/* Glowing Orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-amber-600/15 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px] pointer-events-none animate-float" />

      {/* Transparent Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10 animate-slide-down">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <span className="text-xl font-extrabold bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
            SPICE &amp; BITE
          </span>
          <a href="#menu" className="text-sm text-amber-400 hover:underline">
            Signature Menu ({menuItems.length})
          </a>
        </div>
      </nav>

      {/* Hero Banner */}
      <header className="relative py-16 px-5 text-center border-b border-white/10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 animate-slow-zoom"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&q=80')",
          }}
        />
        <div className="relative max-w-3xl mx-auto animate-fade-up">
          <span className="px-4 py-1 text-xs uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Royal Fine Dining
          </span>
          <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold">
            Taste The Magic of{" "}
            <span className="text-amber-400">Spice &amp; Bite</span>
          </h1>
          <p className="mt-4 text-gray-300">
            Authentic recipes, sizzling grills, and live menu management powered by Next.js &amp; NeonDB.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10 space-y-12 relative z-10">
        {/* Add / Edit Form */}
        <section
          id="form-box"
          className="animate-fade-up backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-5 text-amber-400">
            {editingId ? "Edit Menu Item" : "Add New Dish"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Dish Name (e.g. Chicken Karahi)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Price in PKR (e.g. 1450)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold hover:scale-105 transition cursor-pointer"
              >
                {submitting ? "Saving..." : editingId ? "Save Changes" : "+ Add Dish"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setPrice("");
                    setDescription("");
                  }}
                  className="px-5 py-3 rounded-xl bg-white/10 text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Menu Cards Grid */}
        <section id="menu">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-extrabold">
              Our <span className="text-amber-400">Menu</span>
            </h2>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none w-full sm:w-64"
            />
          </div>

          {loading ? (
            <p className="text-gray-400">Loading menu...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No dishes found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  className="animate-fade-up group backdrop-blur-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getDishImage(item.name, idx)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 border border-amber-400/40 text-amber-300 font-bold text-sm">
                        Rs. {item.price}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2">
                        {item.description || "Prepared fresh with authentic spices."}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t border-white/10 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black font-medium transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-medium transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Spice &amp; Bite Restaurant
      </footer>
    </div>
  );
}

