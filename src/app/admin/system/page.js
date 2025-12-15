"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, isCeo } from "@/utils/role";
import { isAdminLoggedIn } from "@/utils/auth-admin";

export default function UsersPage() {
  const router = useRouter();

  const [fetchOpen, setFetchOpen] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingImportForm, setLoadingImportForm] = useState(false);
  const [loadingImportUser, setLoadingImportUser] = useState(false);
  const [importFixResult, setImportFixResult] = useState(null);
  const [data, setData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importUserResult, setImportUserResult] = useState(null);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  // ----- check permission -----
  useEffect(() => {
    if (!isAdmin() && !isCeo()) {
      router.replace("/403");
      return;
    }

    if (!isAdminLoggedIn()) {
      router.replace("/admin/login-admin");
      return;
    }
  }, [router]);

  // ----- fetch-all toggle -----
  const fetchAll = async () => {
    if (fetchOpen) {
      // ปิด view
      setFetchOpen(false);
      return;
    }

    setLoadingFetch(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`${API}/api/scripts/fetch-all`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`ไม่พบ JSON:\n${text}`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fetch failed");

      setData(json);
      setFetchOpen(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingFetch(false);
    }
  };

  // ----- import functions -----
  const importServerFix = async () => {
    setLoadingImport(true);
    setError("");
    setImportFixResult(null); // reset

    try {
      const res = await fetch(`${API}/api/scripts/import-server-fix`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`ไม่พบ JSON:\n${text}`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setImportFixResult(json); // <-- แก้ตรงนี้
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImport(false);
    }
  };

  const importServerForm = async () => {
    setLoadingImportForm(true);
    setError("");
    setImportResult(null);

    try {
      const res = await fetch(`${API}/api/scripts/import-server-form`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`ไม่พบ JSON:\n${text}`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setImportResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImportForm(false);
    }
  };

  const importServerUser = async () => {
    setLoadingImportUser(true);
    setError("");
    setImportUserResult(null);

    try {
      const res = await fetch(`${API}/api/scripts/import-server-user`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`ไม่พบ JSON:\n${text}`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setImportUserResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImportUser(false);
    }
  };

  const importAll = async () => {
    await Promise.all([
      importServerFix(),
      importServerForm(),
      importServerUser(),
    ]);
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Fetch All Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#000080] text-white rounded-xl p-4 shadow-md gap-2">
          <h1 className="text-lg font-bold">Admin System - TRIUP Fetch</h1>

          {/* Switch */}
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={fetchOpen}
              onChange={fetchAll}
              disabled={loadingFetch}
            />
            <div
              className="w-16 h-8 rounded-full transition-colors duration-300
                    bg-red-500 peer-checked:bg-green-500
                    peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"
            >
              <div
                className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md
                      transform transition-transform duration-300
                      peer-checked:translate-x-8"
              ></div>
            </div>
            <span className="ml-3 text-sm font-medium">
              {loadingFetch ? "Loading..." : fetchOpen ? "เปิด" : "ปิด"}
            </span>
          </label>
        </div>

        {/* Import Sections */}
        {fetchOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TRIUP Import */}
            <div className="bg-[#f9f9f9] rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer flex flex-col justify-between">
              <h2 className="font-semibold mb-2 text-[#000080]">
                TRIUP Import
              </h2>
              <button
                onClick={importServerFix}
                disabled={loadingImport}
                className="bg-white text-[#000080] px-3 py-2 rounded-xl hover:bg-gray-100 disabled:opacity-50"
              >
                {loadingImport ? "Importing..." : "Run"}
              </button>
            </div>

            {/* Import Server Form */}
            <div className="bg-[#f9f9f9] rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
              <h2 className="font-semibold mb-2 text-[#000080]">
                Import Server Form
              </h2>
              <button
                onClick={importServerForm}
                disabled={loadingImportForm}
                className="bg-white text-[#000080] px-3 py-2 rounded-xl hover:bg-gray-100 disabled:opacity-50"
              >
                {loadingImportForm ? "Importing..." : "Run"}
              </button>
            </div>

            {/* Import Server User */}
            <div className="bg-[#f9f9f9] rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
              <h2 className="font-semibold mb-2 text-[#000080]">
                Import Server User
              </h2>
              <button
                onClick={importServerUser}
                disabled={loadingImportUser}
                className="bg-white text-[#000080] px-3 py-2 rounded-xl hover:bg-gray-100 disabled:opacity-50"
              >
                {loadingImportUser ? "Importing..." : "Run"}
              </button>
            </div>

            {/* Import All */}
            <div className="bg-[#f0f4ff] rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
              <h2 className="font-semibold mb-2 text-[#000080]">Import All</h2>
              <button
                onClick={importAll}
                className="bg-white text-[#000080] px-3 py-2 rounded-xl hover:bg-gray-100"
              >
                Run All
              </button>
            </div>
          </div>
        )}

        {/* Error / Notification */}
        {error && (
          <div className="text-red-500 text-sm whitespace-pre-wrap mt-2">
            {error}
          </div>
        )}

        {/* Import Results */}
        <div className="space-y-2 mt-4">
          {data && data.items && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-2">Fetch All Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs table-auto">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left">Key</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Path / Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.key} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{item.key}</td>
                        <td className="px-3 py-2">
                          {item.status === "ok" ? (
                            <span className="text-green-700 font-medium">
                              OK
                            </span>
                          ) : (
                            <span className="text-red-700 font-medium">
                              Error
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 break-all">
                          {item.status === "ok" ? item.path : item.error}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2 text-right text-gray-500 text-xs">
                  Fetched at: {data.fetchedAt}
                </div>
              </div>
            </div>
          )}

          {importResult && importResult.counts && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-2">Server Form Import Results</h3>
              {Object.entries(importResult.counts).map(([key, count]) => (
                <div key={key} className="text-sm">
                  {key}: {count}
                </div>
              ))}
            </div>
          )}

          {importFixResult && importFixResult.counts && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-2 text-[#000080]">
                TRIUP Import Results
              </h3>
              {Object.entries(importFixResult.counts).map(([key, count]) => (
                <div key={key} className="text-sm">
                  {key}: {count}
                </div>
              ))}
            </div>
          )}

          {importUserResult && importUserResult.counts && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-2">
                Users & Researchers Import Results
              </h3>
              {Object.entries(importUserResult.counts).map(([key, count]) => (
                <div key={key} className="text-sm">
                  {key}: {count}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
