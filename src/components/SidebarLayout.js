"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  House,
  User,
  LogOut,
  LayoutGrid,
  Settings2,
} from "lucide-react";

/* ================= Media Query ================= */
function useMedia(query) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return match;
}

/* ================= Top App Bar ================= */
function TopAppBar({
  mobile,
  open,
  setOpen,
  displayName,
  roleName,
  menuOpen,
  setMenuOpen,
  handleSignOut,
  router,
}) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b sticky top-0 z-30">
      {/* ☰ Mobile only */}
      {mobile ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      ) : (
        <div />
      )}

      {/* PROFILE */}
      <div className="relative flex items-center gap-3 ml-auto">
        {/* name (hide on mobile) */}
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-sm font-medium text-gray-900">
            {displayName}
          </div>
          {roleName && (
            <div className="text-xs text-gray-500">{roleName}</div>
          )}
        </div>

        {/* avatar button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <User className="h-4 w-4 text-gray-600" />
        </button>

        {/* dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50">
            {/* PROFILE */}
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile"); // 👈 เปลี่ยน path ได้
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              โปรไฟล์
            </button>

            {/* LOGOUT */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ================= Sidebar Layout ================= */
export default function SidebarLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const desktop = useMedia("(min-width:1024px)");
  const mobile = !desktop;

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState(null);

  /* ---------- Auto behavior ---------- */
  useEffect(() => {
    setMounted(true);
    setOpen(desktop); // desktop เปิด / mobile ปิด
  }, [desktop]);

  /* ---------- Lock scroll (mobile) ---------- */
  useEffect(() => {
    document.body.style.overflow =
      mobile && open ? "hidden" : "";
  }, [open, mobile]);

  /* ---------- Load session ---------- */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setSession)
      .catch(() => router.replace("/"));
  }, [router]);

  /* ---------- Logout ---------- */
  const handleSignOut = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/logout`,
        { method: "POST", credentials: "include" }
      );
    } catch {}
    window.location.href = "/";
  };

  /* ---------- Derived ---------- */
  const displayName =
    session?.profile?.fullname ||
    session?.user?.username ||
    "Guest";

  const roleName = session?.role?.roles_name;
  const roleId = session?.role?.roles_id;
  const isAdmin = roleId === 1000 || roleId === 900;

  const links = useMemo(
    () => [{ href: "/user-psu/home", label: "Home", icon: House }],
    []
  );

  const linksAdmin = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/admin/system", label: "System", icon: Settings2 },
      { href: "/admin/users-data", label: "Users", icon: User },
    ],
    []
  );

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          bg-[#003C71] text-white
          transition-all duration-300 ease-in-out
          ${
            desktop
              ? open
                ? "w-64"
                : "w-16"
              : open
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full"
          }
        `}
      >
        {/* PSU Triup + ☰ (desktop only) */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-white/10">
          {desktop && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {open && (
            <span className="text-sm font-semibold tracking-wide">
              PSU Triup
            </span>
          )}
        </div>

        {/* USER MENU */}
        <nav className="p-2 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => mobile && setOpen(false)}
                className={`
                  flex items-center rounded-xl text-sm
                  ${open ? "px-3 gap-3 h-10" : "justify-center h-10 w-10 mx-auto"}
                  ${active ? "bg-white/20" : "hover:bg-white/10"}
                `}
              >
                <Icon className="h-5 w-5" />
                {open && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ADMIN MENU */}
        {isAdmin && (
          <nav className="p-2 mt-3 border-t border-white/10 space-y-1">
            {open && (
              <div className="px-3 py-1 text-xs text-white/60">
                Admin
              </div>
            )}
            {linksAdmin.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => mobile && setOpen(false)}
                  className={`
                    flex items-center rounded-xl text-sm
                    ${open ? "px-3 gap-3 h-10" : "justify-center h-10 w-10 mx-auto"}
                    ${active ? "bg-white/20" : "hover:bg-white/10"}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {open && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        )}
      </aside>

      {/* Overlay (Mobile only) */}
      {mobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ================= MAIN ================= */}
      <div
        className={`
          flex-1 transition-[margin] duration-300
          ${desktop ? (open ? "ml-64" : "ml-16") : "ml-0"}
        `}
      >
        <TopAppBar
          mobile={mobile}
          open={open}
          setOpen={setOpen}
          displayName={displayName}
          roleName={roleName}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          handleSignOut={handleSignOut}
          router={router}
        />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
