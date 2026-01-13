import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ไม่ใช่ admin → ผ่าน
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // หน้า login-admin → ผ่าน
  if (pathname.startsWith("/admin/login-admin")) {
    return NextResponse.next();
  }

  // อ่าน cookie admin
  const token = req.cookies.get("admin_session")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login-admin";
    return NextResponse.redirect(url);
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/login-api-triup/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("invalid");

    const data = await res.json();

    // อนุญาตเฉพาะ ADMIN (1000) / CEO (900)
    if (![1000, 900].includes(data.user.roles_id)) {
      const url = req.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login-admin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
