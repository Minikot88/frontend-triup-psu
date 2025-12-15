"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { isAdminLoggedIn } from "@/utils/auth-admin";
import { isAdminOrCeo, getSession } from "@/utils/role";

// CHARTS
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [fullname, setFullname] = useState("");
  const [roleName, setRoleName] = useState("");

  const [usersStat, setUsersStat] = useState(null);
  const [findingsStat, setFindingsStat] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [budget, setBudget] = useState([]);
  const [departmentStat, setDepartmentStat] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!isAdminOrCeo()) {
      router.replace("/403");
      return;
    }

    if (!isAdminLoggedIn()) {
      router.replace("/admin/login-admin");
      return;
    }

    const session = getSession();

    const _fullname =
      session?.profile?.fullname ||
      `${session?.profile?.first_name ?? ""} ${
        session?.profile?.last_name ?? ""
      }`.trim() ||
      session?.user?.username ||
      "User";

    setFullname(_fullname);
    setRoleName(session?.user?.role_name || "");

    async function loadStatistics() {
      const u = await fetch(`${API}/api/statistics/users`).then((r) =>
        r.json()
      );
      const f = await fetch(`${API}/api/statistics/findings`).then((r) =>
        r.json()
      );
      const m = await fetch(`${API}/api/statistics/findings/monthly`).then(
        (r) => r.json()
      );
      const y = await fetch(`${API}/api/statistics/findings/yearly`).then((r) =>
        r.json()
      );
      const b = await fetch(`${API}/api/statistics/budget/year`).then((r) =>
        r.json()
      );
      const d = await fetch(`${API}/api/statistics/department`).then((r) =>
        r.json()
      );

      setUsersStat(u.data);
      setFindingsStat(f.data);
      setMonthly(m.data);
      setYearly(y.data);
      setBudget(b.data);
      setDepartmentStat(d.data);
    }

    loadStatistics();
    setReady(true);
  }, []);

  if (!ready) return null;

  // 🎨 สีสันแบบสุภาพ
  const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#6366F1"];

  return (
    <SidebarLayout>
      <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, <span className="font-medium">{fullname}</span> ·{" "}
            <span className="text-red-600 font-medium">{roleName}</span>
          </p>
        </header>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            title="ผู้ใช้ทั้งหมด"
            value={usersStat?.total_users || 0}
            color="red"
          />
          <Card
            title="ผลงานทั้งหมด"
            value={findingsStat?.total_findings || 0}
            color="blue"
          />
          <Card
            title="สถานะผลงาน"
            value={findingsStat?.findings_by_status?.length || 0}
            color="purple"
          />
          <Card
            title="ภาควิชา"
            value={departmentStat?.length || 0}
            color="green"
          />
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="ผู้ใช้ตาม Role">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={usersStat?.users_by_role || []}
                  dataKey="_count.roles_id"
                  nameKey="roles_name"
                  outerRadius={90}
                >
                  {(usersStat?.users_by_role || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="สถานะผลงาน">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={findingsStat?.findings_by_status || []}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="_count.status" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="งานวิจัยรายเดือน">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="งานวิจัยรายปี">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearly}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="งบประมาณรายปี">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={budget}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#10B981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* EXPORT */}
        <div className="flex gap-3">
          <a
            href={`${API}/api/statistics/export/excel`}
            className="px-4 py-2 rounded-lg text-sm font-medium
              bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Export Excel
          </a>
          <a
            href={`${API}/api/statistics/export/pdf`}
            className="px-4 py-2 rounded-lg text-sm font-medium
              bg-red-600 text-white hover:bg-red-700 transition"
          >
            Export PDF
          </a>
        </div>
      </div>
    </SidebarLayout>
  );
}

function Card({ title, value, color }) {
  const map = {
    red: "text-red-600",
    blue: "text-blue-600",
    green: "text-emerald-600",
    purple: "text-indigo-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-2xl font-semibold mt-1 ${map[color]}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-medium text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}
