"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { getSession } from "@/utils/role";
import {
  User,
  IdCard,
  Building2,
  Briefcase,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/");
      return;
    }
    setSession(s);
    setReady(true);
  }, []);

  if (!ready) return null;

  const profile = session?.profile || {};
  const user = session?.user || {};

  const fullname =
    profile.fullname ||
    `${profile.prefix ?? ""}${profile.first_name ?? ""} ${
      profile.last_name ?? ""
    }`.trim();

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6 py-6">

        {/* Header */}
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            โปรไฟล์ผู้ใช้งาน
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ข้อมูลส่วนตัวและสิทธิ์การใช้งานในระบบ
          </p>
        </header>

        {/* Profile */}
        <Section title="ข้อมูลส่วนตัว">
          <Row icon={IdCard} label="User ID" value={user.username} />
          <Row icon={User} label="คำนำหน้า" value={profile.prefix} />
          <Row icon={User} label="ชื่อ" value={profile.first_name} />
          <Row icon={User} label="นามสกุล" value={profile.last_name} />
          <Row icon={User} label="ชื่อ-นามสกุล" value={fullname} />
          <Row icon={Briefcase} label="รหัสบุคลากร" value={profile.staffid} />
        </Section>

        {/* Organization */}
        <Section title="หน่วยงาน">
          <Row
            icon={Building2}
            label="ภาควิชา"
            value={profile.department_name}
          />
          <Row
            icon={Building2}
            label="วิทยาเขต"
            value={profile.campus_name}
          />
        </Section>

        {/* System */}
        <Section title="ข้อมูลระบบ">
          <Row icon={Shield} label="Role" value={user.role_name} />
        </Section>
      </div>
    </SidebarLayout>
  );
}

/* ---------------- Components ---------------- */

function Section({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl px-6 py-5">
      <h2 className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900 font-medium">
          {value || "-"}
        </div>
      </div>
    </div>
  );
}
