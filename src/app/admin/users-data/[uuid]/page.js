"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { User, IdCard, Building2, Briefcase, Shield } from "lucide-react";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid;

  const [user, setUser] = useState(null);
  const [rolesId, setRolesId] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleMap = {
    900: "CEO",
    1000: "ผู้ดูแลระบบ",
    2000: "เจ้าหน้าที่วิจัย",
    3000: "ผู้ใช้งานทั่วไป",
    4000: "ผู้ร่วมวิจัยภายนอก",
    5000: "ผู้ชมข้อมูล",
    6000: "อื่นๆ",
  };

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

  const load = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL;
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

  const updateRole = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const changedBy = getActiveAdmin();

    const confirm = await Swal.fire({
      title: "ยืนยันการเปลี่ยน Role?",
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

  if (loading)
    return (
      <SidebarLayout>
        <div className="p-6 text-sm text-black/60">กำลังโหลดข้อมูล...</div>
      </SidebarLayout>
    );

  if (!user)
    return (
      <SidebarLayout>
        <div className="p-6 text-red-500 text-sm">ไม่พบข้อมูลผู้ใช้</div>
      </SidebarLayout>
    );

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


  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white">
          <h1 className="text-xl font-semibold">
            ข้อมูลผู้ใช้ : {user.username}
          </h1>
        </div>

        {/* Login Info */}
        <div className="bg-white border rounded-2xl p-6 space-y-2">
          <p className="text-xs"><b>Username:</b> {user.username}</p>
          <p className="text-xs">
            <b>Department:</b>{" "}
            <span className="text-blue-600">
              {user.profile?.department_name || "-"}
            </span>
          </p>
          <p className="text-xs">
            <b>Current Role:</b>{" "}
            <span className="text-emerald-600 font-semibold">
              {roleMap[user.roles_id]}
            </span>
          </p>
        </div>

        {/* Profile */}
        {/* Profile */}
<div className="space-y-4">
  {/* ข้อมูลส่วนตัว */}
  <Section title="ข้อมูลส่วนตัว">
    <Row icon={User} label="User ID" value={user.username} />
    <Row icon={User} label="คำนำหน้า" value={user.profile?.prefix} />
    <Row icon={User} label="ชื่อ" value={user.profile?.first_name} />
    <Row icon={User} label="นามสกุล" value={user.profile?.last_name} />
    <Row
      icon={User}
      label="ชื่อ-นามสกุล"
      value={`${user.profile?.prefix ?? ""}${user.profile?.first_name ?? ""} ${user.profile?.last_name ?? ""}`.trim()}
    />
    <Row icon={Briefcase} label="รหัสบุคลากร" value={user.profile?.staffid} />
  </Section>

  {/* หน่วยงาน */}
  <Section title="หน่วยงาน">
    <Row icon={Building2} label="ภาควิชา" value={user.profile?.department_name} />
    <Row icon={Building2} label="วิทยาเขต" value={user.profile?.campus_name} />
  </Section>

  {/* ข้อมูลระบบ */}
  <Section title="ข้อมูลระบบ">
    <Row icon={Shield} label="Role" value={roleMap[user.roles_id]} />
  </Section>
</div>


        {/* Update Role */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold">แก้ไข Role</h2>

          {user.roles_id === 900 && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ CEO ไม่สามารถแก้ไขสิทธิ์ได้
            </div>
          )}

          <select
            disabled={user.roles_id === 900}
            className="px-3 py-2 text-xs border rounded-lg"
            value={rolesId}
            onChange={(e) => setRolesId(Number(e.target.value))}
          >
            {Object.entries(roleMap)
              .filter(([k]) => Number(k) !== 900)
              .map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
          </select>

          <div className="flex gap-3">
            <button
              disabled={user.roles_id === 900}
              onClick={updateRole}
              className="px-5 py-2 text-xs bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
            >
              บันทึก
            </button>
            <button
              onClick={() => router.back()}
              className="px-5 py-2 text-xs border rounded-lg"
            >
              กลับ
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-3">ประวัติการเปลี่ยนสิทธิ์</h2>

          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">เดิม</th>
                <th className="p-2 border">ใหม่</th>
                <th className="p-2 border">โดย</th>
                <th className="p-2 border">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.log_id}>
                  <td className="p-2 border">{l.old_role_name}</td>
                  <td className="p-2 border text-blue-600">{l.new_role_name}</td>
                  <td className="p-2 border">{l.changed_by}</td>
                  <td className="p-2 border">
                    {new Date(l.changed_at).toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </SidebarLayout>
  );
}
