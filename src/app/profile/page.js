"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("not login");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => router.replace("/"));
  }, [router]);

  if (!data) return null;

  // ✅ ดึงข้อมูลให้ตรง API จริง
  const { profile, role } = data;
  const roleName = role?.roles_name;

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto py-10 space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-900 text-white flex items-center justify-center text-lg font-semibold">
            {profile.first_name?.[0] || "U"}
          </div>

          <div>
            <div className="text-xl font-semibold text-gray-900">
              {profile.fullname || "-"}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-blue-900">
                {profile.position_th || "-"}
              </span>

              {roleName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium
                               bg-blue-100 text-blue-900 border border-blue-200"
                  >
                    {roleName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= PERSONAL INFO ================= */}
        <Section title="ข้อมูลส่วนตัว">
          <Row label="ชื่อ" value={profile.first_name} />
          <Row label="นามสกุล" value={profile.last_name} />
          <Row label="ชื่อ-นามสกุล" value={profile.fullname} />
          <Row label="อีเมล" value={profile.email} />
        </Section>

        {/* ================= WORK INFO ================= */}
        <Section title="ข้อมูลการทำงาน">
          <Row label="รหัสบุคลากร" value={profile.staffid} />
          <Row label="ตำแหน่ง" value={profile.position_th} />
          <Row label="หน่วยงาน" value={profile.office_name_th} />
          <Row label="ภาควิชา" value={profile.department_name} />
          <Row label="วิทยาเขต" value={profile.campus_name} />
        </Section>

        {/* ================= ACCOUNT ================= */}
        <Section title="บัญชีผู้ใช้">
          <Row label="Username" value={profile.username} />
          <Row
            label="Role"
            value={
              roleName ? (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium
                             bg-blue-100 text-blue-900 border border-blue-200"
                >
                  {roleName}
                </span>
              ) : (
                "-"
              )
            }
          />
        </Section>

      </div>
    </SidebarLayout>
  );
}

/* ================= UI COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-blue-100 shadow-sm">
      <div className="px-6 py-4 border-b border-blue-100 bg-blue-50 rounded-t-2xl">
        <h2 className="text-sm font-semibold text-blue-900 tracking-wide">
          {title}
        </h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>

      <div className="col-span-2 text-sm text-gray-900 break-words">
        {value || "-"}
      </div>
    </div>
  );
}
