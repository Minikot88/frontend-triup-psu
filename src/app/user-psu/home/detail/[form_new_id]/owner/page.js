"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OwnerPage() {
  const { form_new_id } = useParams();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!form_new_id) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/master/form-new-findings/${form_new_id}`
    )
      .then((res) => res.json())
      .then((json) => {
        const owner = json?.data?.owner;
        setOwners(Array.isArray(owner) ? owner : owner ? [owner] : []);
      })
      .finally(() => setLoading(false));
  }, [form_new_id]);

  if (loading) return <div className="text-sm text-gray-500">กำลังโหลด...</div>;
  if (owners.length === 0)
    return <div className="text-sm text-gray-500">ไม่มีข้อมูลเจ้าของผลงาน</div>;

  return (
    <div className="space-y-8">
      {owners.map((o, idx) => {
        const objectives = safeParse(o.objective);
        const periods = safeParse(o.period);

        return (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6"
          >
            {/* ===== Header ===== */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#000080]">
                  👤 เจ้าของผลงาน #{idx + 1}
                </h2>
                <p className="text-xs text-gray-500">
                  รหัสคำขอ: {o.form_own_code}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border
                ${
                  o.form_own_status?.includes("ผ่าน")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {o.form_own_status}
              </span>
            </div>

            {/* ===== ข้อมูลเจ้าของ ===== */}
            <Section title="ข้อมูลเจ้าของผลงาน">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="ชื่อ-สกุล" value={o.fullname} />
                <Info label="ประเภทความเป็นเจ้าของ" value={o.is_ownership_status} />
                <Info label="ลักษณะเจ้าของ" value={o.form_own_ownertype} />
                <Info label="หน่วยงาน (เจ้าของ)" value={o.form_own_department} />
              </div>
            </Section>

            {/* ===== หน่วยงาน / ตำแหน่ง ===== */}
            <Section title="หน่วยงานและตำแหน่ง">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="หน่วยงาน" value={o.form_own_co_department} />
                <Info label="ตำแหน่ง" value={o.form_own_co_position} />
              </div>
            </Section>

            {/* ===== ติดต่อ ===== */}
            <Section title="ข้อมูลติดต่อ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="โทรศัพท์" value={o.form_own_co_tel} />
                <Info label="Email" value={o.form_own_co_mail} />
              </div>
            </Section>

            {/* ===== ผลงานวิจัย ===== */}
            <Section title="ผลงานวิจัย">
              <p className="text-sm text-gray-700 leading-relaxed">
                {o.form_own_form_name}
              </p>
            </Section>

            {/* ===== วัตถุประสงค์ ===== */}
            {objectives.length > 0 && (
              <Section title="วัตถุประสงค์การใช้ประโยชน์">
                <div className="space-y-2">
                  {objectives.flat().map((item, i) => (
                    <div
                      key={i}
                      className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ===== แผนดำเนินงาน ===== */}
            {periods.length > 0 && (
              <Section title="แผนการดำเนินงาน">
                <div className="space-y-3">
                  {periods.map((row, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-[#000080] bg-gray-50 rounded-md p-4 text-sm space-y-1"
                    >
                      {row.map((r, j) => (
                        <div key={j}>{r}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ===== ข้อมูลระบบ ===== */}
            <Section title="ข้อมูลระบบ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info
                  label="วันที่ตรวจสอบ"
                  value={formatDate(o.form_own_checked_date)}
                />
                <Info
                  label="วันที่อนุมัติ"
                  value={formatDate(o.form_own_date_approve)}
                />
                <Info
                  label="วันที่สร้างข้อมูล"
                  value={formatDate(o.form_own_created_at)}
                />
                <Info
                  label="วันที่แก้ไขล่าสุด"
                  value={formatDate(o.form_own_updated_at)}
                />
              </div>
            </Section>
          </div>
        );
      })}
    </div>
  );
}

/* ===== Helper Components ===== */

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        {children}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}

function safeParse(str) {
  try {
    if (!str) return [];
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
