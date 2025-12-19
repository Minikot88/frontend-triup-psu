"use client";

import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { isAdmin, isCeo } from "@/utils/role";
import { isAdminLoggedIn } from "@/utils/auth-admin";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const pageSize = 10;

  const roleMap = {
    900: { name: "CEO" },
    1000: { name: "ผู้ดูแลระบบ" },
    2000: { name: "เจ้าหน้าที่วิจัย" },
    3000: { name: "ผู้ใช้งานทั่วไป" },
    4000: { name: "ผู้ร่วมวิจัยภายนอก" },
    5000: { name: "ผู้ชมข้อมูล" },
    6000: { name: "อื่นๆ" },
  };

  // useEffect(() => {
  //   if (!isAdmin() && !isCeo()) {
  //     router.replace("/403");
  //     return;
  //   }

  //   if (!isAdminLoggedIn()) {
  //     router.replace("/admin/login-admin");
  //     return;
  //   }
  // }, [router]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;

    async function load() {
      try {
        const res = await fetch(`${API}/api/admin/users`);
        const json = await res.json();

        if (json.success) setUsers(json.data || []);
        else throw new Error(json.error);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const roleCount = users.reduce((acc, u) => {
    acc[u.roles_id] = (acc[u.roles_id] || 0) + 1;
    return acc;
  }, {});

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((u) => {
      const matchSearch = [
        u.username,
        u.profile?.fullname,
        roleMap[u.roles_id]?.name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      const matchRole =
        roleFilter === "all" || Number(roleFilter) === u.roles_id;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const renderPagination = () => {
    const pages = [];
    const add = (p) => {
      if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
    };

    add(1);
    add(currentPage - 1);
    add(currentPage);
    add(currentPage + 1);
    add(totalPages);

    pages.sort((a, b) => a - b);

    const final = [];
    let last = 0;
    pages.forEach((p) => {
      if (p - last > 1) final.push("...");
      final.push(p);
      last = p;
    });

    return final.map((p, i) =>
      p === "..." ? (
        <span key={i} className="px-2 text-xs text-gray-400">
          …
        </span>
      ) : (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`px-3 py-1 rounded-md text-xs border transition ${
            p === currentPage
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header */}
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            รายชื่อผู้ใช้และสิทธิ์การเข้าถึงในระบบ
          </p>
        </header>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="ค้นหา username / ชื่อ / role"
            className="px-3 py-2 text-xs border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="px-3 py-2 text-xs border border-gray-300 rounded-md w-56 bg-white"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Role ทั้งหมด</option>

            {Object.entries(roleMap)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([id, role]) => (
                <option key={id} value={id}>
                  {role.name} ({roleCount[id] || 0})
                </option>
              ))}
          </select>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">ไม่พบข้อมูล</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        Username
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        ชื่อ - นามสกุล
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        Role
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((u) => (
                      <tr
                        key={u.user_pk_uuid}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{u.username}</td>
                        <td className="px-4 py-2">
                          {u.profile?.fullname || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {roleMap[u.roles_id]?.name}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Link
                            href={`/admin/users-data/${u.user_pk_uuid}`}
                            className="text-xs text-gray-700 hover:underline"
                          >
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 px-4 py-3">
                {renderPagination()}
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
