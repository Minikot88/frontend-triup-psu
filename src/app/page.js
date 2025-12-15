"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await apiPost("/api/psu_auth/login", {
        username: username.trim(),
        password,
      });

      if (res?.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "psuSession",
            JSON.stringify({
              token: res.session?.token || null,
              user: res.user || null,
              profile: res.profile || null,
            })
          );
        }
        router.push("/user-psu/home");
      } else {
        setMsg(res?.message || "ไม่สามารถเข้าสู่ระบบได้");
      }
    } catch (error) {
      setMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8">
        {/* Header */}
        <h1 className="text-center text-lg font-semibold text-gray-800">
          PSU Login
        </h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          Prince of Songkla University
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="
              w-full px-4 py-3 text-sm
              rounded-xl border border-gray-300
              text-gray-900 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-3 pr-11 text-sm
                rounded-xl border border-gray-300
                text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 hover:text-gray-600
                focus:outline-none
              "
              aria-label="toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 transition
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Error */}
        {msg && (
          <p className="mt-4 text-center text-sm text-red-600">{msg}</p>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Prince of Songkla University
        </p>
      </div>
    </main>
  );
}
