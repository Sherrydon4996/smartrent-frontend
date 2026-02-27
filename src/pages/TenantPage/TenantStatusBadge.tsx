// tenantPage/TenantStatusBadge.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface TenantStatusBadgeProps {
  status: "active" | "left";
  className?: string;
}

export function TenantStatusBadge({
  status,
  className,
}: TenantStatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold",
        status === "active"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        className
      )}
    >
      {status === "active" ? "Active" : "Left"}
    </span>
  );
}
