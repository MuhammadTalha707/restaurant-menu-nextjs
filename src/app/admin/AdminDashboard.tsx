"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category?: string;
  image_url?: string;
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

  // Menu states
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [imageUrl, setImageUrl] = useState("");
  const [addingDish, setAddingDish] = useState(false);

  // Edit Dish states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // Bookings states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGuests, setEditGuests] = useState("");
  const [editBookingDate, setEditBookingDate] = useState("");
  const [updatingBooking, setUpdatingBooking] = useState(false);

  // Change Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [passError, setPassError] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const fetchData = async () => {
    try {
      const [menuRes, bookingsRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/bookings"),
      ]);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setItems(menuData);
      }
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Add Dish
  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingDish(true);
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          category,
          image_url: imageUrl,
        }),
      });
      if (res.ok) {
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        await fetchData();
      }
    } finally {
      setAddingDish(false);
    }
  };

  // Dish Edit/Delete
  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
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
        setEditingId(null);
        await fetchData();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchData();
    }
  };

  // Booking Edit/Delete
  const startEditBooking = (b: Booking) => {
    setEditingBookingId(b.id);
    setEditCustomerName(b.customer_name);
    setEditPhone(b.phone);
    setEditGuests(String(b.guests));
    setEditBookingDate(b.booking_date);
  };

  const cancelEditBooking = () => {
    setEditingBookingId(null);
  };

  const handleUpdateBooking = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    setUpdatingBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          customer_name: editCustomerName,
          phone: editPhone,
          guests: Number(editGuests),
          booking_date: editBookingDate,
        }),
      });
      if (res.ok) {
        setEditingBookingId(null);
        await fetchData();
      }
    } finally {
      setUpdatingBooking(false);
    }
  };

  const handleDeleteBooking = async (id: number) => {
    const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchData();
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage("");
    setPassError("");

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || "Failed to update password.");
      } else {
        setPassMessage("Password updated and hashed securely!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPassError("Network error while updating password.");
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-bold">
              Spice &amp; Flame
            </span>
            <h1 className="text-2xl font-black">Admin Control Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition"
            >
              View Live Menu
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Top Grid: Add New Dish & Change Password */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Dish */}
          <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-7">
            <h2 className="text-xl font-extrabold text-amber-400 mb-5">Add New Dish</h2>
            <form onSubmit={handleAddDish} className="space-y-3.5">
              <input
                type="text"
                placeholder="Dish Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price (PKR)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. BBQ)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <textarea
                placeholder="Short Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={addingDish}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-sm font-extrabold cursor-pointer"
              >
                {addingDish ? "Adding Dish..." : "+ Add Dish to Menu"}
              </button>
            </form>
          </div>

          {/* Security: Change Admin Password */}
          <div className="rounded-3xl bg-white/[0.04] border border-amber-500/30 p-7">
            <h2 className="text-xl font-extrabold text-amber-400 mb-2">
              Security: Change Admin Password
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Passwords are stored with salted scrypt encryption in NeonDB.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />

              {passError && (
                <p className="text-xs text-red-400 font-semibold">{passError}</p>
              )}
              {passMessage && (
                <p className="text-xs text-emerald-400 font-semibold">{passMessage}</p>
              )}

              <button
                type="submit"
                disabled={changingPass}
                className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-sm font-extrabold transition cursor-pointer"
              >
                {changingPass ? "Updating Password..." : "Update Admin Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Table Bookings Section (With Edit & Delete) */}
        <div className="rounded-3xl bg-white/[0.04] border border-emerald-500/30 p-7">
          <h2 className="text-xl font-extrabold text-emerald-400 mb-5">
            Table Reservations ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-400">Abhi tak koi table book nahi hui.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-black/50 border border-white/10">
                  {editingBookingId === b.id ? (
                    <form onSubmit={(e) => handleUpdateBooking(e, b.id)} className="space-y-2.5">
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-black/80 border border-emerald-500/50 text-xs text-white"
                        placeholder="Customer Name"
                      />
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-black/80 border border-emerald-500/50 text-xs text-white"
                        placeholder="Phone Number"
                      />
                      <input
                        type="number"
                        min={1}
                        value={editGuests}
                        onChange={(e) => setEditGuests(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-black/80 border border-emerald-500/50 text-xs text-white"
                        placeholder="Number of Guests"
                      />
                      <input
                        type="text"
                        value={editBookingDate}
                        onChange={(e) => setEditBookingDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-black/80 border border-emerald-500/50 text-xs text-white"
                        placeholder="Booking Date / Time"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={updatingBooking}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold cursor-pointer"
                        >
                          {updatingBooking ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditBooking}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-white">{b.customer_name}</p>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            {b.guests} Guests
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 font-semibold">{b.booking_date}</p>
                        <p className="text-xs text-gray-400">Phone: {b.phone}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
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


                      