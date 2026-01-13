// src/lib/auth.js

export async function logout() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await res.json();

  // ถ้า backend ส่ง PSU logout url กลับมา
  if (data.logout_url) {
    window.location.href = data.logout_url;
  } else {
    // fallback
    window.location.href = "/login";
  }
}
