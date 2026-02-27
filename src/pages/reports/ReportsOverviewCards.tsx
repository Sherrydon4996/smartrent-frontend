// ReportsOverviewCards.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { formatMoney } from "@/utils/utils";

interface ReportsOverviewCardsProps {
  tenantBalances: any;
  buildingFilter: string;
  currentMonth: string;
  isLoading: boolean;
}

export function ReportsOverviewCards({
  tenantBalances,
  buildingFilter,
  currentMonth,
  isLoading,
}: ReportsOverviewCardsProps) {
  const currency = useAppSelector((state) => state.settingsQ.currency);

  const stats = [
    {
      title: "Total Tenants",
      value: tenantBalances?.summary?.totalTenants ?? 0,
      subtext:
        buildingFilter !== "all"
          ? `in ${buildingFilter}`
          : "across all buildings",
      icon: Building2,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-900 dark:text-purple-300",
    },
    {
      title: "Total Expected",
      value: tenantBalances?.summary?.totalExpectedRent ?? 0,
      subtext: `for ${currentMonth}`,
      icon: TrendingUp,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-900 dark:text-blue-300",
    },
    {
      title: "Total Collected",
      value: tenantBalances?.summary?.totalCollected ?? 0,
      subtext:
        tenantBalances?.summary?.totalExpectedRent > 0
          ? `${((tenantBalances?.summary?.totalCollected / tenantBalances?.summary?.totalExpectedRent) * 100).toFixed(1)}% collected`
          : "0% collected",
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-900 dark:text-green-300",
    },
    {
      title: "Total Credit",
      value: tenantBalances?.summary?.totalCredit ?? 0,
      subtext: `${tenantBalances?.summary?.tenantsWithCredit ?? 0} tenant(s) with credit`,
      icon: DollarSign,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor:
        "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      textColor: "text-emerald-900 dark:text-emerald-300",
    },
    {
      title: "Outstanding",
      value: tenantBalances?.summary?.totalOutstanding ?? 0,
      subtext: `${tenantBalances?.summary?.tenantsWithDebt ?? 0} tenant(s) owing`,
      icon: AlertCircle,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor:
        "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-900 dark:text-red-300",
    },
  ];

  return (
    <div className="relative">
      <div
        className={`
          flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory
          scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
          md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-hidden md:snap-none
        `}
      >
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`
              flex-shrink-0 w-64 md:w-auto
              shadow-sm border transition-all hover:shadow-md
              bg-gradient-to-br ${stat.bgColor} ${stat.borderColor}
              min-w-[240px] snap-start md:min-w-0
            `}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className={`text-xs font-medium ${stat.textColor}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <>
                  <div className={`text-xl font-bold ${stat.textColor}`}>
                    {stat.title.includes("Total Tenants")
                      ? stat.value
                      : formatMoney(stat.value, currency)}
                  </div>
                  <p className={`text-xs ${stat.iconColor} mt-0.5`}>
                    {stat.subtext}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
    </div>
  );
}
