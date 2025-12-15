"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Forbidden() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      
      {/* Glow background */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-600/30 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gray-500/20 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 max-w-md w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600/20 text-red-500 shadow-lg">
          <ShieldAlert className="h-10 w-10" />
        </div>

        {/* 403 */}
        <h1 className="text-6xl font-extrabold tracking-tight text-red-500 drop-shadow">
          403
        </h1>

        {/* Text */}
        <p className="mt-4 text-lg font-medium">
          Access Forbidden
        </p>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้  
          กรุณาติดต่อผู้ดูแลระบบ หากคุณคิดว่านี่คือความผิดพลาด
        </p>

        {/* Divider */}
        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-red-700 hover:scale-105 active:scale-95 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-xs text-white/40">
        © {new Date().getFullYear()} PSU Secure System
      </footer>
    </main>
  );
}
