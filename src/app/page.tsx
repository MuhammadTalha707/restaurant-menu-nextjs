"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartDrawer, MenuItem } from "@/components/Modals";

interface Booking {
  id: number;
  customer_name: string;
  phone: string;
  guests: number;
  booking_date: string;
}

const getPhoto = (name: string, id: number) => {
  const n = name.toLowerCase();
  if (n.includes("pizza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80";
  if (n.includes("biryani") || n.includes("pulao") || n.includes("rice")) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80";
  if (n.includes("burger") || n.includes("zinger") || n.includes("sandwich")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80";
  if (n.includes("karahi") || n.includes("handi") || n.includes("chicken") || n.includes("mutton") || n.includes("qorma")) return "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80";
  if (n.includes("kabab") || n.includes("tikka") || n.includes("boti") || n.includes("bbq") || n.includes("grill")) return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80";
  if (n.includes("pasta") || n.includes("macaroni") || n.includes("noodle")) return "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80";
  if (n.includes("sweet") || n.includes("jamun") || n.includes("cake") || n.includes("ice")) return "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80";
  const others = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  ];
  return others[id % others.length];
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bName, setBName] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bGuests, setBGuests] = useState("4");
  const [bDate, setBDate] = useState("");
  const [bookedMsg, setBookedMsg] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 800);
    return () => clearTimeout(t);
  }, []);

  const loadData = async () => {
    try {
      const [mRes, bRes] = await Promise.all([fetch("/api/menu"), fetch("/api/bookings")]);
      const mData = await mRes.json();
      const bData = await bRes.json();
      if (Array.isArray(mData)) setItems(mData);
      if (Array.isArray(bData)) setBookings(bData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_name: bName, phone: bPhone, guests: Number(bGuests), booking_date: bDate || "Tonight 8:00 PM" }),
    });
    if (res.ok) {
      setBName("");
      setBPhone("");
      setBDate("");
      setBookedMsg("Table reserved in NeonDB!");
      loadData();
    }
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
      <div className={`fixed inset-0 z-50 bg-[#050507] flex flex-col items-center justify-center transition-all duration-700 pointer-events-none ${intro ? "opacity-100" : "opacity-0 scale-105"}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-3xl animate-bounce">S</div>
        <p className="mt-4 text-xl font-extrabold tracking-[0.3em] text-amber-400">SPICE &amp; BITE</p>
      </div>

      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-xl">S</span>
            <span className="text-xl font-extrabold text-amber-400">SPICE &amp; BITE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <a href="#menu" className="hover:text-amber-400">Menu</a>
            <a href="#reserve" className="hover:text-amber-400">Book Table ({bookings.length})</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-xs sm:text-sm font-semibold transition">
              Admin Login
            </Link>
            <button onClick={() => setCartOpen(true)} className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs sm:text-sm font-bold cursor-pointer">
              Order Bag ({totalCount})
            </button>
          </div>
        </div>
      </nav>

      <header className="relative min-h-[80vh] flex items-center justify-center px-6 text-center border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&q=80')" }} />
        <div className="relative max-w-4xl mx-auto animate-fade-up">
          <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest">Open Today • 12:00 PM – 1:00 AM</span>
          <h1 className="mt-6 text-4xl sm:text-7xl font-black leading-tight">Where Tradition Meets <span className="text-amber-400">Royal Flavor</span></h1>
          <p className="mt-6 text-gray-300 text-base sm:text-xl max-w-2xl mx-auto">Slow-cooked Mughlai karahis, charcoal-smoked BBQ, and handcrafted delicacies in an unforgettable atmosphere.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#menu" className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold">Explore Full Menu</a>
            <a href="#reserve" className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold">Reserve a Table</a>
          </div>
        </div>
      </header>

      <section id="menu" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-10">Signature <span className="text-amber-400">Dishes</span></h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {["All", "BBQ & Karahi", "Rice", "Fast Food", "Desserts"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer ${activeTab === tab ? "bg-amber-500 text-black" : "bg-white/5 text-gray-300 border border-white/10"}`}>{tab}</button>
            ))}
          </div>
          <input type="text" placeholder="Search dish..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2.5 rounded-full bg-white/5 border border-white/15 text-sm text-white w-full md:w-72" />
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleItems.map((item) => (
              <div key={item.id} className="group backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img src={getPhoto(item.name, item.id)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <span className="absolute top-3 right-3 px-3.5 py-1 rounded-full bg-amber-500 text-black font-extrabold text-sm">Rs. {item.price}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <p className="text-gray-400 text-sm mt-2">{item.description || "Chef's special recipe."}</p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/10">
                  <button onClick={() => addToCart(item)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs font-bold cursor-pointer">+ Add to Order</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="reserve" className="max-w-5xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-center mb-6">Book Your <span className="text-amber-400">Table</span></h2>
          <form onSubmit={handleBookTable} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <input type="text" placeholder="Your Name" value={bName} onChange={(e) => setBName(e.target.value)} required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <input type="tel" placeholder="Phone Number" value={bPhone} onChange={(e) => setBPhone(e.target.value)} required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <input type="number" min={1} max={20} value={bGuests} onChange={(e) => setBGuests(e.target.value)} required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <input type="text" placeholder="Date/Time (e.g. Tonight 9 PM)" value={bDate} onChange={(e) => setBDate(e.target.value)} required className="px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white" />
            <button type="submit" className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-sm cursor-pointer">Confirm Booking</button>
          </form>
          {bookedMsg && <p className="mt-4 text-center text-emerald-400 text-sm font-semibold">✓ {bookedMsg}</p>}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/60 py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} SPICE &amp; BITE RESTAURANT • MM Alam Road, Lahore
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onRemove={(id) => setCart((p) => p.filter((x) => x.item.id !== id))} onOrder={() => { setCart([]); setOrderPlaced(true); setTimeout(() => { setOrderPlaced(false); setCartOpen(false); }, 1800); }} orderPlaced={orderPlaced} />
    </div>
  );
}

