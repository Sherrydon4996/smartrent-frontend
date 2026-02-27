// src/pages/tenantPage/TenantTable.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney, icons, isFutureMonth } from "@/utils/utils";
import { TenantRowActions } from "./TenantRowACtions";
import { TenantStatusBadge } from "./TenantStatusBadge";
import { getPaymentStatus } from "./utils";
import { useAppSelector } from "@/store/hooks";
import type { Tenant } from "@/pages/TenantPage/types";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { getIconEmoji } from "../buildingPage/utils";

interface TenantTableProps {
  tenants: Tenant[];
  onViewDetails: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onPrintReceipt: (tenant: Tenant) => void;
  onViewPayments: (tenant: Tenant) => void;
}

export function TenantTable({
  tenants,
  onViewDetails,
  onEdit,
  onDelete,
  onPrintReceipt,
  onViewPayments,
}: TenantTableProps) {
  const currency = useAppSelector((state) => state.settingsQ.currency);
  const selectedMonth = useAppSelector((state) => state.tenants?.selectedMonth);
  const selectedYear = useAppSelector((state) => state.tenants?.selectedYear);
  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();
  const buildingsData = buildings ?? [];

  const getBuildingByName = (name: string) => {
    return buildingsData.find((b) => b.name === name);
  };

  // Safe check for empty tenants
  if (!tenants || tenants.length === 0) {
    return (
      <Card className="shadow-card overflow-hidden">
        <div className="text-center py-16 text-muted-foreground">
          No tenants found for the selected month / filters.
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                Tenant
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                <div className="flex items-center gap-1">
                  <icons.building2 className="w-4 h-4" />
                  Building
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                House
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                Rent
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                <div className="flex items-center gap-1">
                  <icons.droplets className="w-4 h-4" />
                  Water
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                <div className="flex items-center gap-1">
                  <icons.trash2 className="w-4 h-4" />
                  Garbage
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                <div className="flex items-center gap-1">
                  <icons.trendingUp className="w-4 h-4" />
                  Credit / Advance
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                Balance
              </th>
              <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                Status
              </th>
              <th className="text-right py-4 px-4 font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants?.map((tenant) => {
              // Safety checks
              if (!tenant || !tenant.id) return null;

              const isInactive = tenant?.status === "left";
              const paymentStatus = getPaymentStatus(tenant);
              const building = getBuildingByName(tenant.buildingName ?? "");
              const hasCredit = (tenant.tenantCredit ?? 0) > 0;
              const future =
                selectedMonth && selectedYear
                  ? isFutureMonth(selectedYear, selectedMonth)
                  : false;

              return (
                <tr
                  key={tenant.id}
                  className={cn(
                    "border-b border-border transition-colors",
                    isInactive
                      ? "bg-muted/60 opacity-60"
                      : paymentStatus === "overdue"
                        ? "status-overdue"
                        : paymentStatus === "paid"
                          ? "status-paid"
                          : "hover:bg-muted/30",
                  )}
                >
                  <td className="py-4 px-4">
                    <div>
                      <p
                        className={cn(
                          "font-medium",
                          isInactive
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {tenant.name ?? "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <icons.phone className="w-3.5 h-3.5" />
                        {tenant.mobile ?? "N/A"}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getIconEmoji(building?.icon) || "🏢"}
                      </span>
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isInactive && "text-muted-foreground",
                        )}
                      >
                        {tenant.buildingName ?? "Unknown"}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div>
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isInactive && "text-muted-foreground",
                        )}
                      >
                        {tenant.houseNumber ?? "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tenant?.houseSize}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <p
                      className={cn(
                        "font-medium text-sm",
                        isInactive && "text-muted-foreground",
                      )}
                    >
                      {formatMoney(tenant.monthlyRent ?? 0, currency)}
                    </p>
                    {(tenant.penalties ?? 0) > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                        +{formatMoney(tenant.penalties, currency)} penalty
                      </p>
                    )}
                  </td>

                  <td className="py-4 px-4 text-sm font-medium">
                    {formatMoney(tenant.waterBill ?? 0, currency)}
                  </td>

                  <td className="py-4 px-4 font-medium text-sm">
                    {formatMoney(tenant.garbageBill ?? 0, currency)}
                  </td>

                  {/* Credit / Advance column */}
                  <td className="py-4 px-4">
                    {hasCredit ? (
                      <div>
                        <p className="font-semibold text-sm text-green-600 dark:text-green-400">
                          {formatMoney(tenant.tenantCredit, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {future
                            ? "Credit (for future months)"
                            : "Advance / Credit balance"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>

                  {/* Balance column */}
                  <td className="py-4 px-4">
                    <div>
                      <p
                        className={cn(
                          "font-bold text-base",
                          (tenant.balanceDue ?? 0) > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400",
                        )}
                      >
                        {(tenant.balanceDue ?? 0) > 0 ? (
                          formatMoney(Math.abs(tenant.balanceDue), currency)
                        ) : (
                          <span className="text-green-600 font-semibold text-sm">
                            Fully Paid ✓
                          </span>
                        )}
                      </p>

                      {hasCredit && (tenant.balanceDue ?? 0) <= 0 && (
                        <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                          Covered + {formatMoney(tenant.tenantCredit, currency)}{" "}
                          remaining
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <TenantStatusBadge status={tenant.status} />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <TenantRowActions
                      tenant={tenant}
                      isPaid={(tenant.balanceDue ?? 0) <= 0}
                      onViewDetails={onViewDetails}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onPrintReceipt={onPrintReceipt}
                      onViewPayments={onViewPayments}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
