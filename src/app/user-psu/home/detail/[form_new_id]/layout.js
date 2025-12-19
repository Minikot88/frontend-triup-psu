"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function DetailLayout({ children }) {

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-[#000080] rounded-xl px-6 py-4 text-white">
          <h1 className="text-lg font-bold">
            รายละเอียดผลงานวิจัย 
          </h1>
        </div>

        {/* Tab Menu */}
        <div className="flex gap-6 text-sm border-b">
          <Tab href="owner" label="Owner" />
          <Tab href="plan" label="Plan" />
          <Tab href="utilization" label="Utilization" />
          <Tab href="extend" label="Extend" />
        </div>

        {children}
      </div>
    </SidebarLayout>
  );
}

function Tab({ href, label }) {
  return (
    <a
      href={href}
      className="pb-2 border-b-2 border-transparent hover:border-[#000080] hover:text-[#000080]"
    >
      {label}
    </a>
  );
}
