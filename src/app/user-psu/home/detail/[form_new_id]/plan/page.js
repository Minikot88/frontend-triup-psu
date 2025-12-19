"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlanPage() {
  const { form_new_id } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/master/form-new-findings/${form_new_id}`
    )
      .then((res) => res.json())
      .then((json) => setPlans(json?.data?.plan || []))
      .finally(() => setLoading(false));
  }, [form_new_id]);

  if (loading) return <div className="text-sm">กำลังโหลด...</div>;
  if (plans.length === 0)
    return <div className="text-sm text-gray-500">ไม่มีข้อมูล Plan</div>;

  return (
    <div className="space-y-6">
      {plans.map((p, idx) => {
        const objectives = safeParse(p.objective);
        const periods = safeParse(p.period);

        return (
          <div
            key={idx}
            className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-[#000080]">
                  📋 แผนการใช้ประโยชน์ #{idx + 1}
                </h2>
                <p className="text-xs text-gray-500">
                  รหัสแผน: {p.form_plan_code}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium
                ${
                  p.form_plan_status?.includes("ผ่าน")
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {p.form_plan_status}
              </span>
            </div>

            {/* ข้อมูลผู้รับผิดชอบ */}
            <section>
              <h3 className="font-semibold text-sm mb-2">
                👤 ข้อมูลผู้รับผิดชอบ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <Info label="ชื่อ-สกุล" value={p.fullname} />
                <Info label="ตำแหน่ง" value={p.form_plan_position} />
                <Info label="หน่วยงาน" value={p.form_plan_department} />
                <Info label="อีเมล" value={p.form_plan_email} />
                <Info label="โทรศัพท์" value={p.form_plan_tel} />
              </div>
            </section>

            {/* ข้อมูลแผน */}
            <section>
              <h3 className="font-semibold text-sm mb-2">
                📊 ข้อมูลแผนการใช้ประโยชน์
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <Info label="ประเภทการวิจัย" value={p.form_plan_type_status} />
                <Info
                  label="ระยะเวลาโครงการ"
                  value={`${p.form_plan_period} เดือน`}
                />
                <Info
                  label="มูลค่าการใช้ประโยชน์"
                  value={`${Number(
                    p.form_plan_usage_value
                  ).toLocaleString()} บาท`}
                />
                <Info label="กลุ่มเป้าหมาย" value={p.form_plan_target} />
                <Info label="ผลลัพธ์ที่คาดหวัง" value={p.form_plan_result} />
              </div>
            </section>

            {/* วัตถุประสงค์ */}
            {objectives.length > 0 && (
              <section>
                <h3 className="font-semibold text-sm mb-2">
                  🎯 วัตถุประสงค์การใช้ประโยชน์
                </h3>

                <div className="space-y-2">
                  {objectives.flat().map((o, i) => (
                    <div
                      key={i}
                      className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm"
                    >
                      {o}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Timeline */}
            {periods.length > 0 && (
              <section>
                <h3 className="font-semibold text-sm mb-2">
                  🗓️ แผนการดำเนินงาน
                </h3>

                <div className="space-y-3">
                  {periods.map((row, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-[#000080] pl-4 py-2 text-sm bg-gray-50 rounded-md"
                    >
                      {row.map((r, j) => (
                        <div key={j}>{r}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Helpers ---------- */

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">
        {value || "-"}
      </div>
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
