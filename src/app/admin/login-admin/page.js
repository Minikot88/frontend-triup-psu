"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");

    if (!email?.trim() || !password?.trim()) {
      setMsg("กรอกอีเมล/รหัสผ่านก่อน");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost("/api/login-api-triup/login", {
        email,
        password,
      });

      const token = res?.session?.id;
      const expISO = res?.session?.expiresAt;

      if (res?.success && token && expISO) {
        const expMs = new Date(expISO).getTime();
        localStorage.setItem("token", token);
        localStorage.setItem("token_exp", String(expMs));

        router.replace("/admin/dashboard");
      } else {
        setMsg(res?.error || "username หรือ password ไม่ถูกต้อง");
      }
    } catch (err) {
      setMsg(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-center text-sm font-semibold tracking-widest text-red-600">
          ADMIN LOGIN
        </h1>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium
              hover:bg-red-700 transition
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {msg && (
          <div className="mt-4 text-center text-xs text-red-600">
            {msg}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Prince of Songkla University
        </div>
      </div>
    </main>
  );
}
