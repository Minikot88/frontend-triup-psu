"use client";

import SidebarLayout from "@/components/SidebarLayout";
import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { EllipsisVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openMenu, setOpenMenu] = useState(null);
  const router = useRouter();

  const pageSize = 15;

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/master/form-new-findings`)
      .then((res) => res.json())
      .then((json) =>
        json.success ? setFindings(json.data) : setError(json.error)
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Filter ---------- */
  const filtered = useMemo(() => {
    return findings
      .filter((i) =>
        [i.report_code, i.report_title_th, i.report_title_en, i.status]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .filter((i) =>
        statusFilter === "all" ? true : i.status === statusFilter
      );
  }, [findings, searchTerm, statusFilter]);

  /* ---------- Pagination ---------- */
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pages = useMemo(() => {
    const setPages = new Set([
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages,
    ]);
    const arr = [...setPages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    let result = [];
    let last = 0;
    arr.forEach((p) => {
      if (p - last > 1) result.push("...");
      result.push(p);
      last = p;
    });
    return result;
  }, [currentPage, totalPages]);

  /* ---------- Export ---------- */
  const exportCSV = () => {
    const rows = filtered.map((r) => ({
      report_code: r.report_code,
      report_title_th: r.report_title_th,
      report_title_en: r.report_title_en,
      status: r.status,
    }));
    const csv = [
      ["Report Code", "Title TH", "Title EN", "Status"],
      ...rows.map((r) => [
        r.report_code,
        `"${r.report_title_th?.replace(/"/g, '""')}"`,
        `"${r.report_title_en?.replace(/"/g, '""')}"`,
        `"${r.status?.replace(/"/g, '""')}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    link.download = "findings.csv";
    link.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Findings");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "findings.xlsx");
  };

  /* ---------- Status Badge ---------- */
  const StatusBadge = ({ status }) => {
    const style = status.includes("ยืนยัน")
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status.includes("รอตรวจ")
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${style}`}
        title={status}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  const loadDetail = async (formNewId) => {
    if (detailCache[formNewId]) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(
      `${API_URL}/api/master/form-new-findings/${formNewId}`
    );
    const json = await res.json();

    if (json.success) {
      setDetailCache((prev) => ({
        ...prev,
        [formNewId]: json.data,
      }));
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-[#000080] rounded-xl px-6 py-4 shadow-md">
          <h1 className="text-xl font-bold text-white">PSU Triup Act</h1>
          <p className="text-sm text-gray-200 mt-1">รายการรายงานผลงานวิจัย</p>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="w-full md:w-72 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000080]"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="w-full md:w-56 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000080]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">สถานะทั้งหมด</option>
              {[...new Set(findings.map((i) => i.status))].map((st) => (
                <option key={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 text-xs border rounded-md text-[#000080] hover:bg-[#000080]/10 transition"
            >
              Export CSV
            </button>
            <button
              onClick={exportExcel}
              className="px-3 py-2 text-xs border rounded-md text-[#000080] hover:bg-[#000080]/10 transition"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">ไม่พบข้อมูล</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="w-1/6 px-4 py-2 text-left font-medium text-[#000080]">
                        รหัสรายงาน
                      </th>
                      <th className="w-2/6 px-4 py-2 text-left font-medium text-[#000080]">
                        ชื่อเรื่อง (TH)
                      </th>
                      <th className="w-2/6 px-4 py-2 text-left font-medium text-[#000080] hidden lg:table-cell">
                        ชื่อเรื่อง (EN)
                      </th>
                      <th className="w-1/6 px-4 py-2 text-left font-medium text-[#000080]">
                        สถานะ
                      </th>
                      <th className="w-1/6 px-10 py-2 text-center font-medium text-[#000080]">
                        รายละเอียด
                      </th>
                      <th className="w-1/6 px-4 py-2 text-left font-medium text-[#000080]">
                        เพื่มเติม
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((i) => (
                      <tr
                        key={i.findings_pk_id}
                        className="border-b border-gray-100 hover:bg-[#000080]/5"
                      >
                        <td className="px-4 py-2 text-gray-700">
                          {i.report_code}
                        </td>
                        <td
                          className="px-4 py-2 text-gray-700 line-clamp-10"
                          title={i.report_title_th}
                        >
                          {i.report_title_th}
                        </td>
                        <td
                          className="px-4 py-2 text-gray-700 line-clamp-1 hidden lg:table-cell"
                          title={i.report_title_en}
                        >
                          {i.report_title_en}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={i.status} />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <a
                            href={`/home/detail/${i.form_new_id}`}
                            className="text-[#000080] hover:underline text-xs"
                          >
                            ดู
                          </a>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/user-psu/home/detail/${i.form_new_id}/owner`
                              )
                            }
                            className="inline-flex items-center justify-center p-2 rounded-full 
                              text-[#000080] hover:bg-[#000080]/10 transition"
                            title="ดูรายละเอียด"
                          >
                            <Search size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-end gap-2 px-4 py-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1 text-xs rounded-md border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#000080] hover:bg-[#000080]/10"
                  }`}
                >
                  ก่อนหน้า
                </button>
                {pages.map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={`page-${p}-${idx}`}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 text-xs rounded-md border ${
                        p === currentPage
                          ? "bg-[#000080] text-white border-[#000080]"
                          : "bg-white text-[#000080] hover:bg-[#000080]/10"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={`px-3 py-1 text-xs rounded-md border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#000080] hover:bg-[#000080]/10"
                  }`}
                >
                  ถัดไป
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
