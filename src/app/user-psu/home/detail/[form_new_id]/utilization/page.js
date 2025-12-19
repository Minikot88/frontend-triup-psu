"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UtilizationPage() {
  const { form_new_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/master/form-new-findings/${form_new_id}`
    )
      .then((res) => res.json())
      .then((json) => setItems(json.data.utilization || []))
      .finally(() => setLoading(false));
  }, [form_new_id]);

  if (loading) return <div className="text-sm">กำลังโหลด...</div>;
  if (items.length === 0)
    return <div className="text-sm">ไม่มีข้อมูลการนำไปใช้</div>;

  return (
    <div className="space-y-4">
      {items.map((u, idx) => (
        <div
          key={idx}
          className="bg-white border rounded-xl p-4 text-sm"
        >
          <h2 className="font-semibold text-[#000080]">
            🔧 การนำไปใช้ #{idx + 1}
          </h2>

          {Object.entries(u).map(([key, value]) => (
            <p key={key}>
              <b>{key}:</b>{" "}
              {value === null ? "-" : String(value)}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
