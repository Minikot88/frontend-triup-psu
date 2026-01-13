"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAdminGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          // ❌ ไม่ได้ login
          router.replace("/admin/login-admin");
          return;
        }

        const data = await res.json();

        // ❌ ไม่มี role หรือไม่ใช่ admin
        if (!data.role || data.role.roles_id !== 1000) {
          router.replace("/user-psu/home");
          return;
        }

        // ✅ เป็น admin
        setAllowed(true);
      })
      .catch(() => {
        router.replace("/admin/login-admin");
      });
  }, [router]);

  return allowed;
}
