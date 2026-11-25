"use client";

import { useState, useEffect } from "react";
import { AdminModal, CartDrawer, MenuItem } from "@/components/Modals";

const PHOTOS = [
  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
];

const getPhoto = (name: string, idx: number) => {
  const n = name.toLowerCase();
  if (n.includes("biryani") || n.includes("rice")) return PHOTOS[1];
  if (n.includes("burger") || n.includes("zinger")) return PHOTOS[2];
  if (n.includes("kabab") || n.includes("tikka") || n.includes("bbq")) return PHOTOS[3];
  if (n.includes("pizza")) return PHOTOS[4];
  if (n.includes("sweet") || n.includes("jamun")) return PHOTOS[5];
  return PHOTOS[idx % PHOTOS.length];
};

const getCat = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("biryani") || n.includes("rice")) return "Rice";
  if (n.includes("burger") || n.includes("pizza") || n.includes("zinger")) return "Fast Food";
  if (n.includes("sweet") || n.includes("jamun")) return "Desserts";
  return "BBQ & Karahi";
};

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [adminOpen, setAdminOpen] = useState(false);
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [bookedMsg, setBookedMsg] = useState("");
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 900);
    return () => clearTimeout(t);
  }, []);

  const loadMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setSaving(true);
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
        setAdminOpen(false);
        loadMenu();
      }
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setDescription(item.description || "");
    setAdminOpen(true);
  };

  const removeDish = async (id: number) => {
    const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const found = prev.find((c) => c.item.id === item.id);
      if (found) return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const totalCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const visibleItems = items.filter((item) => {
    const mSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const mTab = activeTab === "All" || getCat(item.name) === activeTab;
    return mSearch && mTab;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100 relative overflow-x-hidden">
      {/* Intro Splash */}
      <div className={`fixed inset-0 z-50 bg-[#050507] flex flex-col items-center justify-center transition-all duration-700 pointer-events-none ${intro ? "opacity-100" : "opacity-0 scale-105"}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-3xl animate-bounce">
          S
        </div>
        <p className="mt-4 text-xl font-extrabold tracking-[0.3em] text-amber-400">SPICE &amp; BITE</p>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-xl">S</span>
            <span className="text-xl font-extrabold text-amber-400">SPICE &amp; BITE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <a href="#about" className="hover:text-amber-400">Our Story</a>
            <a href="#menu" className="hover:text-amber-400">Menu</a>
            <a href="#reserve" className="hover:text-amber-400">Book Table</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditingId(null); setName(""); setPrice(""); setDescription(""); setAdminOpen(true); }} className="px-4 py-2 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-xs sm:text-sm font-semibold cursor-pointer">
              + Chef Panel
            </button>
            <button onClick={() => setCartOpen(true)} className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs sm:text-sm font-bold cursor-pointer">
              Order Bag ({totalCount})
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[85vh] flex items-center justify-center px-6 text-center border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 animate-slow-zoom" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&q=80')" }} />
        <div className="relative max-w-4xl mx-auto animate-fade-up">
          <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest">
            Open Today • 12:00 PM – 1:00 AM
          </span>
          <h1 className="mt-6 text-4xl sm:text-7xl font-black leading-tight">
            Where Tradition Meets <span className="text-amber-400">Royal Flavor</span>
          </h1>
          <p className="mt-6 text-gray-300 text-base sm:text-xl max-w-2xl mx-auto">
            Slow-cooked Mughlai karahis, charcoal-smoked BBQ, and handcrafted delicacies in an unforgettable atmosphere.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#menu" className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold">Explore Full Menu</a>
            <a href="#reserve" className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold">Reserve a Table</a>
          </div>
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-white/10">
            <div><p className="text-2xl sm:text-3xl font-black text-amber-400">15+</p><p className="text-xs text-gray-400">Years Legacy</p></div>
            <div><p className="text-2xl sm:text-3xl font-black text-amber-400">4.9 ★</p><p className="text-xs text-gray-400">Guest Rating</p></div>
            <div><p className="text-2xl sm:text-3xl font-black text-amber-400">100%</p><p className="text-xs text-gray-400">Fresh &amp; Halal</p></div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl overflow-hidden border border-white/10 h-[380px]">
          <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&q=80" alt="Interior" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-5">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Our Culinary Story</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold">Crafted For True <span className="text-amber-400">Food Lovers</span></h2>
          <p className="text-gray-400 leading-relaxed">
            Every spice is roasted and ground in-house daily for unmatched aroma and royal taste.
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-10">
          Signature <span className="text-amber-400">Dishes</span>
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {["All", "BBQ & Karahi", "Rice", "Fast Food", "Desserts"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer ${activeTab === tab ? "bg-amber-500 text-black" : "bg-white/5 text-gray-300 border border-white/10"}`}>
                {tab}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search dish..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2.5 rounded-full bg-white/5 border border-white/15 text-sm text-white w-full md:w-72" />
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleItems.map((item, idx) => (
              <div key={item.id} className="animate-fade-up group backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img src={getPhoto(item.name, idx)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <span className="absolute top-3 right-3 px-3.5 py-1 rounded-full bg-amber-500 text-black font-extrabold text-sm">Rs. {item.price}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <p className="text-gray-400 text-sm mt-2">{item.description || "Chef's special recipe."}</p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center">
                  <button onClick={() => addToCart(item)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs font-bold cursor-pointer">+ Add to Order</button>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(item)} className="text-xs px-3 py-2 rounded-xl bg-white/10 text-amber-300 cursor-pointer">Edit</button>
                    <button onClick={() => removeDish(item.id)} className="text-xs px-3 py-2 rounded-xl bg-red-500/15 text-red-400 cursor-pointer">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Book Table Section */}
      <section id="reserve" className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-extrabold text-center mb-6">Book Your <span className="text-amber-400">Table</span></h2>
          <form onSubmit={(e) => { e.preventDefault(); setBookedMsg("Table reserved! Our host will confirm shortly."); }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Your Name" required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <input type="tel" placeholder="Phone Number" required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <input type="number" min={1} max={20} defaultValue={4} required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-sm cursor-pointer">Confirm Booking</button>
          </form>
          {bookedMsg && <p className="mt-4 text-center text-emerald-400 text-sm font-semibold">✓ {bookedMsg}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-10 px-6 text-center text-sm text-gray-400">
        <p className="font-bold text-amber-400">SPICE &amp; BITE RESTAURANT • MM Alam Road, Lahore</p>
        <p className="text-xs text-gray-600 mt-2">© {new Date().getFullYear()} All rights reserved.</p>
      </footer>

      <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} editingId={editingId} name={name} setName={setName} price={price} setPrice={setPrice} description={description} setDescription={setDescription} onSubmit={handleSaveDish} saving={saving} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onRemove={(id) => setCart((p) => p.filter((x) => x.item.id !== id))} onOrder={() => { setCart([]); setOrderPlaced(true); setTimeout(() => { setOrderPlaced(false); setCartOpen(false); }, 1800); }} orderPlaced={orderPlaced} />
    </div>
  );
}

