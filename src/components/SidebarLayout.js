"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, House, User, List, LogOut, LayoutGrid, Settings2 } from "lucide-react";

// ✅ IMPORT ROLE FUNCTIONS ให้ครบ
import { isAdmin, isCeo } from "@/utils/role";

/* ---------- Media Query ---------- */
function useMedia(query) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (!window?.matchMedia) return;
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
    <header className="h-14 flex items-center justify-end px-4 border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="relative flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium">{displayName}</div>
          <div className="text-xs text-gray-500">{roleName}</div>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <User className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              โปรไฟล์
            </button>
            {/* <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/list");
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <List className="h-4 w-4" />
              รายการ
            </button> */}

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
  const [roleName, setRoleName] = useState("");

  const [mounted, setMounted] = useState(false);

  // ✅ เก็บ role แบบ object (ถูกต้อง)
  const [isAdminUser, setIsAdminUser] = useState({
    admin: false,
    ceo: false,
  });

  const pathname = usePathname();
  const desktop = useMedia("(min-width:1024px)");
  const router = useRouter();

  /* ---------- Load session (CLIENT ONLY) ---------- */
  useEffect(() => {
    setMounted(true);

    const raw = localStorage.getItem("psuSession");
    if (raw) {
      const s = JSON.parse(raw);
      setSession(s);
      setRoleName(s?.user?.role_name || "User");
    }

    // ✅ เรียก role functions ได้แล้ว
    setIsAdminUser({
      admin: isAdmin(),
      ceo: isCeo(),
    });
  }, []);

  /* ---------- Lock body scroll on mobile ---------- */
  useEffect(() => {
    document.body.style.overflow = !desktop && open ? "hidden" : "";
  }, [open, desktop]);

  const handleSignOut = () => {
    localStorage.removeItem("psuSession");
    router.replace("/");
  };

  const displayName =
    session?.profile?.fullname || session?.user?.username || "Guest";

  const links = useMemo(
    () => [{ href: "/user-psu/home", label: "Home", icon: House }],
    []
  );

  const linksAdmin = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/admin/system", label: "System", icon: Settings2  },
      { href: "/admin/users-data", label: "Users", icon: User },
    ],
    []
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all z-40
        ${open ? "w-64" : "w-14"}`}
      >
        <div className="h-14 flex items-center gap-2 px-3 border-b border-gray-200">
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          {open && <span className="text-sm font-semibold">PSU Triup Act</span>}
        </div>

        {/* User Menu */}
        <nav className="p-2 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm
                ${active ? "bg-gray-100 font-medium" : "hover:bg-gray-100"}`}
              >
                <Icon className="h-4 w-4" />
                {open && label}
              </Link>
            );
          })}
        </nav>

        {/* Admin / CEO Menu */}
        {mounted && (isAdminUser.admin || isAdminUser.ceo) && (
          <nav className="p-2 space-y-1">
            {open && (
              <div className="px-3 py-1 text-xs text-gray-400">Admin</div>
            )}
            {linksAdmin.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm
                  ${active ? "bg-gray-100 font-medium" : "hover:bg-gray-100"}`}
                >
                  <Icon className="h-4 w-4" />
                  {open && label}
                </Link>
              );
            })}
          </nav>
        )}
      </aside>

      {/* Mobile Overlay */}
      {!desktop && open && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className={`flex-1 ${open ? "lg:ml-64" : "lg:ml-14"}`}>
        <TopAppBar
          displayName={displayName}
          roleName={roleName}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          router={router}
          handleSignOut={handleSignOut}
        />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
