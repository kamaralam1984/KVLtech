"use client";

import { TenantManager } from "@/components/admin/TenantManager";

export default function TenantsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <TenantManager />
    </div>
  );
}
