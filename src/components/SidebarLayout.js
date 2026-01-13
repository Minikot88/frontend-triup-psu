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

/* ---------- Media Query ---------- */
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

/* ---------- Top App Bar ---------- */
function TopAppBar({
  displayName,
  roleName,
  menuOpen,
  setMenuOpen,
  router,
  handleSignOut,
}) {
  return (
    <header className="h-14 flex items-center justify-end px-6 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="relative flex items-center gap-4">
        <div className="text-right leading-tight">
          <div className="text-sm font-medium text-gray-900">
            {displayName}
          </div>
          {roleName && (
            <div className="text-xs text-gray-500">{roleName}</div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
        >
          <User className="h-4 w-4 text-gray-600" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden animate-fade-in">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              โปรไฟล์
            </button>

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

/* ---------- Sidebar Layout ---------- */
export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const desktop = useMedia("(min-width:1024px)");
  const router = useRouter();

  /* ---------- LOAD SESSION ---------- */
  useEffect(() => {
    setMounted(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("not login");
        return res.json();
      })
      .then((json) => setSession(json))
      .catch(() => {
        setSession(null);
        router.replace("/");
      });
  }, [router]);

  /* ---------- Lock body scroll (mobile) ---------- */
  useEffect(() => {
    document.body.style.overflow = !desktop && open ? "hidden" : "";
  }, [open, desktop]);

  /* ---------- Logout ---------- */
  const handleSignOut = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const json = await res.json();
      if (json.logout_url) {
        window.location.href = json.logout_url;
        return;
      }
    } catch { }
    window.location.href = "/";
  };

  /* ---------- Derived ---------- */
  const displayName =
    session?.profile?.fullname ||
    session?.user?.display_name ||
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

  /* ---------- RENDER ---------- */
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          bg-[#003C71] text-white
          transition-[width] duration-300 ease-in-out
          ${open ? "w-64" : "w-16"}
        `}
      >
        {/* Toggle */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10">
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded hover:bg-white/10 transition"
          >
            <Menu
              className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"
                }`}
            />
          </button>

          <span
            className={`
              text-sm font-semibold tracking-wide
              transition-all duration-300
              ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
            `}
          >
            PSU Triup Act
          </span>
        </div>

        {/* USER MENU */}
        <nav className="p-2 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
    flex items-center rounded-xl text-sm transition-all duration-200
    ${open ? "px-3 gap-3 justify-start h-10" : "justify-center h-10 w-10 mx-auto"}
    ${active ? "bg-white/20" : "hover:bg-white/10"}
  `}
              >
                <Icon className="h-5 w-5 shrink-0 text-white" />

                {open && (
                  <span className="transition-opacity duration-200">
                    {label}
                  </span>
                )}
              </Link>

            );
          })}
        </nav>

        {/* ADMIN MENU */}
        {isAdmin && (
          <nav className="p-2 mt-3 border-t border-white/10 space-y-1">
            <div
              className={`
                px-3 py-1 text-xs uppercase text-white/60
                transition-all duration-300
                ${open ? "opacity-100" : "opacity-0"}
              `}
            >
              Admin
            </div>

            {linksAdmin.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
    flex items-center rounded-xl text-sm transition-all duration-200
    ${open ? "px-3 gap-3 justify-start h-10" : "justify-center h-10 w-10 mx-auto"}
    ${active ? "bg-white/20" : "hover:bg-white/10"}
  `}
                >
                  <Icon className="h-5 w-5 shrink-0 text-white" />

                  {open && (
                    <span className="transition-opacity duration-200">
                      {label}
                    </span>
                  )}
                </Link>

              );
            })}
          </nav>
        )}
      </aside>

      {/* Overlay */}
      {!desktop && open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== MAIN ===== */}
      <div
        className={`
          flex-1 transition-[margin] duration-300 ease-in-out
          ${open ? "lg:ml-64" : "lg:ml-16"}
        `}
      >
        <TopAppBar
          displayName={displayName}
          roleName={roleName}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          router={router}
          handleSignOut={handleSignOut}
        />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
