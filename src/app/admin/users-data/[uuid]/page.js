"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  User,
  Building2,
  Briefcase,
  Shield,
  ArrowLeft,
} from "lucide-react";

/* ================= ROLE MAP ================= */
const roleMap = {
  900: "CEO",
  1000: "ผู้ดูแลระบบ",
  2000: "เจ้าหน้าที่วิจัย",
  3000: "ผู้ใช้งานทั่วไป",
  4000: "ผู้ร่วมวิจัยภายนอก",
  5000: "ผู้ชมข้อมูล",
  6000: "อื่นๆ",
};

/* ================= UI COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
      <h2 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      {Icon && (
        <Icon className="h-4 w-4 text-blue-300 mt-0.5 shrink-0" />
      )}
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900 font-medium break-words">
          {value || "-"}
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function UserDetailPage() {
  const router = useRouter();
  const { uuid } = useParams();

  const [user, setUser] = useState(null);
  const [rolesId, setRolesId] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  /* ================= ADMIN NAME ================= */

  const getActiveAdmin = () => {
    try {
      const session = JSON.parse(localStorage.getItem("admin_session")) || {};
      return (
        session?.user?.username ||
        session?.profile?.username ||
        session?.admin?.username ||
        session?.username ||
        `${session?.profile?.first_name ?? ""} ${
          session?.profile?.last_name ?? ""
        }`.trim() ||
        "unknown"
      );
    } catch {
      return "unknown";
    }
  };

  /* ================= LOAD DATA ================= */

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users/${uuid}`);
      const json = await res.json();

      setUser(json.data);
      setRolesId(Number(json.data.roles_id));

      const logRes = await fetch(
        `${API}/api/admin/users/${uuid}/role-log`
      );
      const logJson = await logRes.json();
      setLogs(logJson.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) load();
  }, [uuid]);

  /* ================= UPDATE ROLE ================= */

  const updateRole = async () => {
    const changedBy = getActiveAdmin();

    const confirm = await Swal.fire({
      title: "ยืนยันการเปลี่ยน Role?",
      text: "การเปลี่ยนสิทธิ์จะมีผลทันที",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${API}/api/admin/users/${uuid}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roles_id: rolesId,
        changed_by: changedBy,
      }),
    });

    Swal.fire({
      icon: "success",
      title: "บันทึกสำเร็จ",
      timer: 1200,
      showConfirmButton: false,
    });

    load();
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <SidebarLayout>
        <div className="p-6 text-sm text-gray-500">
          กำลังโหลดข้อมูล...
        </div>
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="p-6 text-sm text-red-500">
          ไม่พบข้อมูลผู้ใช้
        </div>
      </SidebarLayout>
    );
  }

  const profile = user.profile || {};

  /* ================= RENDER ================= */

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* ===== BACK BUTTON ===== */}
        <div className="flex items-center">
          <button
            onClick={() => router.push("/admin/users-data")}
            className="
              inline-flex items-center gap-2
              text-sm font-medium text-blue-900
              hover:text-blue-700 transition
            "
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้ารายชื่อผู้ใช้
          </button>
        </div>

        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-4 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-900 text-white flex items-center justify-center text-lg font-semibold">
            {profile.first_name?.[0] || user.username?.[0] || "U"}
          </div>

          <div className="flex-1">
            <div className="text-xl font-semibold text-gray-900">
              {profile.fullname || "-"}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-blue-900">
                {profile.position_th || "-"}
              </span>

              <span className="text-gray-300">•</span>

              <span className="px-3 py-1 rounded-full text-xs font-medium
                               bg-blue-100 text-blue-900 border border-blue-200">
                {roleMap[user.roles_id]}
              </span>
            </div>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="ข้อมูลส่วนตัว">
            <Row icon={User} label="ชื่อ" value={profile.first_name} />
            <Row icon={User} label="นามสกุล" value={profile.last_name} />
            <Row icon={User} label="ชื่อ-นามสกุล" value={profile.fullname} />
            <Row icon={User} label="อีเมล" value={profile.email} />
          </Section>

          <Section title="ข้อมูลการทำงาน">
            <Row icon={Briefcase} label="รหัสบุคลากร" value={profile.staffid} />
            <Row icon={Briefcase} label="ตำแหน่ง" value={profile.position_th} />
            <Row icon={Building2} label="หน่วยงาน" value={profile.office_name_th} />
            <Row icon={Building2} label="ภาควิชา" value={profile.department_name} />
            <Row icon={Building2} label="วิทยาเขต" value={profile.campus_name} />
          </Section>
        </div>

        {/* ===== ACCOUNT ===== */}
        <Section title="บัญชีผู้ใช้">
          <Row label="Username" value={user.username} />
          <Row
            icon={Shield}
            label="Role"
            value={
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium
                               bg-blue-100 text-blue-900 border border-blue-200">
                {roleMap[user.roles_id]}
              </span>
            }
          />
        </Section>

        {/* ===== UPDATE ROLE ===== */}
        <Section title="จัดการสิทธิ์">
          {user.roles_id === 900 && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ CEO ไม่สามารถแก้ไขสิทธิ์ได้
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <select
              disabled={user.roles_id === 900}
              className="px-3 py-2 text-sm border rounded-lg"
              value={rolesId}
              onChange={(e) => setRolesId(Number(e.target.value))}
            >
              {Object.entries(roleMap)
                .filter(([k]) => Number(k) !== 900)
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
            </select>

            <button
              disabled={user.roles_id === 900}
              onClick={updateRole}
              className="px-5 py-2 text-sm bg-blue-900 text-white rounded-lg
                         hover:bg-blue-800 disabled:bg-gray-300"
            >
              บันทึก
            </button>
          </div>
        </Section>

        {/* ===== ROLE LOG ===== */}
        <Section title="ประวัติการเปลี่ยนสิทธิ์">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 border">เดิม</th>
                  <th className="p-3 border">ใหม่</th>
                  <th className="p-3 border">โดย</th>
                  <th className="p-3 border">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.log_id} className="hover:bg-gray-50">
                    <td className="p-3 border">{l.old_role_name}</td>
                    <td className="p-3 border text-blue-700 font-medium">
                      {l.new_role_name}
                    </td>
                    <td className="p-3 border">{l.changed_by}</td>
                    <td className="p-3 border">
                      {new Date(l.changed_at).toLocaleString("th-TH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </SidebarLayout>
  );
}
