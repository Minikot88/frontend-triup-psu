"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= PAGE ================= */
export default function UsersPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

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

  /* ================= CHECK SESSION ================= */
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/admin/login-admin");
        return;
      }

      try {
        const res = await fetch(`${API}/api/login-api-triup/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.clear();
          router.replace("/admin/login-admin");
          return;
        }

        setChecking(false);
      } catch {
        router.replace("/admin/login-admin");
      }
    };

    checkSession();
  }, [API, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Checking session...
      </div>
    );
  }

  const logout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API}/api/login-api-triup/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (e) {
      // ignore error
    } finally {
      // ล้าง localStorage ทุกกรณี
      localStorage.removeItem("token");
      localStorage.removeItem("token_exp");
      localStorage.removeItem("roles_id");

      router.replace("/user-psu/home");
    }
  };

  const handleToggle = () => {
    if (fetchOpen) {
      // 🔴 จาก เปิด → ปิด = logout
      logout();
    } else {
      // 🟢 จาก ปิด → เปิด = fetch
      fetchAll();
    }
  };


  /* ================= FETCH ALL ================= */
  const fetchAll = async () => {
    if (fetchOpen) {
      setFetchOpen(false);
      return;
    }

    setLoadingFetch(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`${API}/api/scripts/fetch-all`);
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

  /* ================= IMPORT FUNCTIONS ================= */
  const importServerFix = async () => {
    setLoadingImport(true);
    setError("");
    setImportFixResult(null);

    try {
      const res = await fetch(`${API}/api/scripts/import-server-fix`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setImportFixResult(json);
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


  /* ================= RENDER ================= */
  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                TRIUP Admin Console
              </h1>
              <p className="text-sm text-blue-100 mt-1">
                ระบบจัดการและนำเข้าข้อมูลกลาง
              </p>
            </div>

            {/* Toggle */}
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <span className="text-sm">
                {loadingFetch ? "Loading..." : fetchOpen ? "เปิด" : "ปิด"}
              </span>

              <input
                type="checkbox"
                className="sr-only peer"
                checked={fetchOpen}
                onChange={handleToggle}
                disabled={loadingFetch}
              />

              <div className="w-14 h-7 bg-red-500 rounded-full peer-checked:bg-green-500 transition relative">
                <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7" />
              </div>
            </label>

          </div>
        </div>

        {/* ===== ACTION CARDS ===== */}
        {fetchOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <ActionCard
              title="TRIUP Import"
              onClick={importServerFix}
              loading={loadingImport}
            />
            <ActionCard
              title="Import Server Form"
              onClick={importServerForm}
              loading={loadingImportForm}
            />
            <ActionCard
              title="Import Server User"
              onClick={importServerUser}
              loading={loadingImportUser}
            />
            <ActionCard
              title="Import All"
              onClick={importAll}
              highlight
            />
          </div>
        )}

        {/* ===== ERROR ===== */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* ===== RESULTS ===== */}
        <div className="space-y-4">
          {data?.items && (
            <ResultCard title="ดึงผลลัพธ์ทั้งหมด">
              {(() => {
                const errors = data.items.filter(
                  (item) => item.status !== "ok"
                );

                if (errors.length === 0) {
                  return (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      ✅ ทุกขั้นตอนดำเนินการสำเร็จเรียบร้อย
                      <div className="text-xs text-gray-500 mt-1">
                        Fetched at: {data.fetchedAt}
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">
                      ⚠️ พบข้อผิดพลาด {errors.length} รายการ
                    </div>

                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Key</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Path / Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.map((item) => (
                          <tr
                            key={item.key}
                            className="border-t hover:bg-gray-50"
                          >
                            <td className="p-3">{item.key}</td>
                            <td className="p-3 text-red-700 font-medium">
                              Error
                            </td>
                            <td className="p-3 break-all">
                              {item.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="text-xs text-gray-500 mt-2 text-right">
                      Fetched at: {data.fetchedAt}
                    </div>
                  </>
                );
              })()}
            </ResultCard>
          )}

          {importFixResult?.counts && (
            <ImportResultCard
              title="TRIUP Import Results"
              counts={importFixResult.counts}
            />
          )}


          {importResult?.counts && (
            <ImportResultCard
              title="Server Form Import Results"
              counts={importResult.counts}
            />
          )}


          {importUserResult?.counts && (
            <ImportResultCard
              title="Users & Researchers Import Results"
              counts={importUserResult.counts}
            />
          )}

        </div>

      </div>
    </SidebarLayout>
  );
}

/* ================= COMPONENTS ================= */

function ActionCard({ title, onClick, loading, highlight }) {
  return (
    <div
      className={`
        rounded-2xl p-5 shadow-sm border
        ${highlight ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}
      `}
    >
      <h3 className="font-medium text-gray-900 mb-3">{title}</h3>
      <button
        onClick={onClick}
        disabled={loading}
        className="
          w-full py-2 text-sm rounded-lg
          bg-blue-900 text-white
          hover:bg-blue-800 disabled:bg-gray-300
        "
      >
        {loading ? "Running..." : "Run"}
      </button>
    </div>
  );
}

function ResultCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ImportResultCard({ title, counts }) {
  return (
    <ResultCard title={title}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(counts).map(([key, value]) => (
          <div
            key={key}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {key}
            </div>
            <div className="text-lg font-semibold text-blue-900 mt-1">
              {value}
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}
