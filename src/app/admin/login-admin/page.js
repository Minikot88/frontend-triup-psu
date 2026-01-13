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
      setMsg("กรุณากรอกอีเมลและรหัสผ่าน");
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
        setMsg(res?.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setMsg(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-10">

        {/* ===== HEADER ===== */}
        <div className="text-center">
          <h1 className="text-sm font-semibold tracking-widest text-red-700">
            ADMIN LOGIN
          </h1>
          <p className="mt-2 text-xs text-gray-500">
            ระบบสำหรับผู้ดูแลระบบเท่านั้น
          </p>
        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@psu.ac.th"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-4 py-2.5 rounded-lg border border-gray-300
                text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-red-600
                focus:border-red-600
              "
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-2.5 rounded-lg border border-gray-300
                text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-red-600
                focus:border-red-600
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-2.5 rounded-lg
              bg-red-700 text-white text-sm font-medium
              hover:bg-red-800 transition
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* ===== MESSAGE ===== */}
        {msg && (
          <div className="mt-5 text-center text-xs text-red-600">
            {msg}
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Prince of Songkla University
        </div>
      </div>
    </main>
  );
}
