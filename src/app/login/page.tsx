"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "change">("login");

  // Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Change Password States
  const [changeUser, setChangeUser] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: changeUser,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password");
      } else {
        setSuccessMsg("Password changed successfully! Sign in with your new password.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMode("login");
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

      <div className="relative w-full max-w-md backdrop-blur-2xl bg-white/[0.04] border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.15)] animate-fade-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-3xl shadow-lg mb-4 animate-bounce">
            S
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            {mode === "login" ? "Executive Chef Portal" : "Admin Credentials"}
          </span>
          <h1 className="text-3xl font-black mt-1">
            {mode === "login" ? "Admin Sign In" : "Change Password"}
          </h1>
          <p className="text-gray-400 text-xs mt-2">
            {mode === "login"
              ? "Authorized staff only. Manage menu & reservations."
              : "Verify your current password to set a new password in NeonDB."}
          </p>
        </div>

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {mode === "login" ? (
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wider text-gray-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setMode("change");
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  Change Password
                </button>
              </div>
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
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition cursor-pointer"
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c5 0 9.27 3.11 11 7.5a11.78 11.78 0 01-4.17 5.19M6.61 6.61A11.74 11.74 0 001 12.5C2.73 16.89 7 20 12 20c1.61 0 3.14-.32 4.53-.9" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs text-center font-semibold">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold tracking-wide shadow-lg hover:scale-[1.01] transition cursor-pointer"
            >
              {loading ? "Verifying Session..." : "Unlock Admin Dashboard →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter admin username (admin)"
                value={changeUser}
                onChange={(e) => setChangeUser(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 cursor-pointer"
                >
                  {showCurrent ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password (min 4 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 cursor-pointer"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 cursor-pointer"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs text-center font-semibold">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-sm cursor-pointer"
            >
              {loading ? "Updating Password..." : "Update Password & Return to Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("login");
              }}
              className="w-full py-2 text-xs text-gray-400 hover:text-amber-400 cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-amber-400 transition">
            ← Back to Public Restaurant Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

