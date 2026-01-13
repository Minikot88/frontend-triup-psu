"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) router.replace("/user-psu/home");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) return null;

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* ===== BACKGROUND LINES ===== */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "url('/bg-psu-lines.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur
                     shadow-lg px-10 py-12"
          style={{ border: "1px solid #003C71" }}
        >
          {/* ===== LOGO ===== */}
          <div className="flex justify-center mb-6">
            <div className="flex justify-center mb-6">
              <Image
                src="/psulogo.png"
                alt="Prince of Songkla University"
                width={120}
                height={120}
                priority
                className="drop-shadow-sm"
              />
            </div>
          </div>

          {/* ===== TITLE ===== */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              PSU Triup Act
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              ระบบเข้าสู่ระบบด้วย PSU One Passport
            </p>
          </div>

          {/* ===== LOGIN BUTTON ===== */}
          <button
            onClick={() => {
              window.location.href =
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/login`;
            }}
            className="
              w-full py-3.5 rounded-xl font-medium text-white
              transition-all duration-200
              shadow-md hover:shadow-lg
            "
            style={{ backgroundColor: "#003C71" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#002F59")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#003C71")
            }
          >
            เข้าสู่ระบบด้วย PSU One Passport
          </button>



          {/* ===== COPYRIGHT ===== */}
          <div className="text-center text-xs text-gray-400 leading-relaxed mt-5">
            © {new Date().getFullYear()} มหาวิทยาลัยสงขลานครินทร์
            <br />
            Prince of Songkla University
          </div>
        </div>
      </div>
    </main>
  );
}
