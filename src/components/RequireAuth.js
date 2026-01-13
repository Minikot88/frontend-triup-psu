"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("unauth");
        return res.json();
      })
      .then(() => setReady(true))
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
