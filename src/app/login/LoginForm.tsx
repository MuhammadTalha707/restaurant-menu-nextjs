"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid username or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative w-full max-w-md backdrop-blur-2xl bg-white/[0.04] border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-3xl shadow-lg mb-4">
            S
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            Executive Chef Portal
          </span>
          <h1 className="text-3xl font-black mt-1">Admin Sign In</h1>
          <p className="text-gray-400 text-xs mt-2">
            Authorized staff only. Manage menu &amp; reservations.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 pr-12 rounded-xl bg-black/60 border border-white/15 text-white focus:border-amber-400 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition cursor-pointer"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold tracking-wide shadow-lg transition cursor-pointer"
          >
            {loading ? "Verifying Session..." : "Unlock Admin Dashboard"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-amber-400 transition">
            Back to Public Restaurant Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

