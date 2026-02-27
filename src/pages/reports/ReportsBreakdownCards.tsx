// ReportsBreakdownCards.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, icons } from "@/utils/utils";
import { useAppSelector } from "@/store/hooks";

interface ReportsBreakdownCardsProps {
  breakdowns: {
    rent: { expected: number; paid: number; outstanding: number };
    water: { expected: number; paid: number; outstanding: number };
    garbage: { expected: number; paid: number; outstanding: number };
  };
  tenantBalances: any;
  isLoading: boolean;
}

export function ReportsBreakdownCards({
  breakdowns,
  tenantBalances,
  isLoading,
}: ReportsBreakdownCardsProps) {
  const currency = useAppSelector((state) => state.settingsQ.currency);

  const sections = [
    {
      title: "Rent (House Bills Only)",
      icon: icons.home,
      stats: [
        {
          label: "Expected Rent",
          value: breakdowns?.rent?.expected,
          icon: icons.home,
          iconColor: "text-blue-600 dark:text-blue-400",
          bgColor:
            "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-900 dark:text-blue-300",
          labelColor: "text-blue-700 dark:text-blue-400",
        },
        {
          label: "Paid Rent",
          value: breakdowns?.rent?.paid,
          icon: icons.checkCircle,
          iconColor: "text-green-600 dark:text-green-400",
          bgColor:
            "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-900 dark:text-green-300",
          labelColor: "text-green-700 dark:text-green-400",
        },
        {
          label: "Outstanding Rent",
          value: breakdowns?.rent?.outstanding,
          icon: icons.alertCircle,
          iconColor: "text-red-600 dark:text-red-400",
          bgColor:
            "from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-900 dark:text-red-300",
          labelColor: "text-red-700 dark:text-red-400",
        },
      ],
    },
    {
      title: "Water Bills",
      icon: icons.droplets,
      stats: [
        {
          label: "Expected Water",
          value: breakdowns?.water?.expected,
          icon: icons.droplets,
          iconColor: "text-cyan-600 dark:text-cyan-400",
          bgColor:
            "from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20",
          borderColor: "border-cyan-200 dark:border-cyan-800",
          textColor: "text-cyan-900 dark:text-cyan-300",
          labelColor: "text-cyan-700 dark:text-cyan-400",
        },
        {
          label: "Paid Water",
          value: breakdowns?.water?.paid,
          icon: icons.checkCircle,
          iconColor: "text-teal-600 dark:text-teal-400",
          bgColor:
            "from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20",
          borderColor: "border-teal-200 dark:border-teal-800",
          textColor: "text-teal-900 dark:text-teal-300",
          labelColor: "text-teal-700 dark:text-teal-400",
        },
        {
          label: "Outstanding Water",
          value: breakdowns?.water?.outstanding,
          icon: icons.alertCircle,
          iconColor: "text-orange-600 dark:text-orange-400",
          bgColor:
            "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-800",
          textColor: "text-orange-900 dark:text-orange-300",
          labelColor: "text-orange-700 dark:text-orange-400",
        },
      ],
    },
    {
      title: "Garbage Collection Fees",
      icon: icons.trash2,
      stats: [
        {
          label: "Expected Garbage",
          value: breakdowns?.garbage?.expected,
          icon: icons.trash2,
          iconColor: "text-amber-600 dark:text-amber-400",
          bgColor:
            "from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800",
          textColor: "text-amber-900 dark:text-amber-300",
          labelColor: "text-amber-700 dark:text-amber-400",
        },
        {
          label: "Paid Garbage",
          value: breakdowns?.garbage?.paid,
          icon: icons.checkCircle,
          iconColor: "text-lime-600 dark:text-lime-400",
          bgColor:
            "from-lime-50 to-lime-100 dark:from-lime-950/30 dark:to-lime-900/20",
          borderColor: "border-lime-200 dark:border-lime-800",
          textColor: "text-lime-900 dark:text-lime-300",
          labelColor: "text-lime-700 dark:text-lime-400",
        },
        {
          label: "Outstanding Garbage",
          value: breakdowns?.garbage?.outstanding,
          icon: icons.alertCircle,
          iconColor: "text-rose-600 dark:text-rose-400",
          bgColor:
            "from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20",
          borderColor: "border-rose-200 dark:border-rose-800",
          textColor: "text-rose-900 dark:text-rose-300",
          labelColor: "text-rose-700 dark:text-rose-400",
        },
      ],
    },
  ];

  return (
    <>
      {sections.map((section, secIndex) => (
        <div key={secIndex} className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <section.icon className="h-4 w-4" />
            {section.title}
          </h3>

          <div className="relative">
            <div
              className={`
                flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory
                scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
                md:grid md:grid-cols-3 md:overflow-x-hidden md:snap-none
              `}
            >
              {section.stats.map((stat, idx) => (
                <Card
                  key={idx}
                  className={`
                    flex-shrink-0 w-64 md:w-auto
                    shadow-sm border transition-all hover:shadow-md
                    bg-gradient-to-br ${stat?.bgColor} ${stat?.borderColor}
                    min-w-[240px] snap-start md:min-w-0
                  `}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5 w-full">
                        {isLoading ? (
                          <>
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-6 w-32" />
                          </>
                        ) : (
                          <>
                            <p
                              className={`text-xs font-medium ${stat?.labelColor}`}
                            >
                              {stat?.label}
                            </p>
                            <p
                              className={`text-lg font-bold ${stat.textColor}`}
                            >
                              {formatMoney(stat?.value, currency)}
                            </p>
                          </>
                        )}
                      </div>
                      <stat.icon
                        className={`h-4 w-4 ${stat.iconColor} mt-0.5`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
          </div>
        </div>
      ))}

      {/* Tenant Credit Balance */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <icons.dollarSign className="h-4 w-4" />
          Tenant Credit Balance
        </h3>

        <div className="relative">
          <div
            className={`
              flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory
              scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
              md:flex md:overflow-x-hidden md:snap-none
            `}
          >
            <Card
              className={`
                flex-shrink-0 w-64 md:w-auto md:flex-1
                shadow-sm border transition-all hover:shadow-md
                bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800
                min-w-[240px] snap-start md:min-w-0
              `}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-56" />
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          Total Credit Across Tenants
                        </p>
                        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">
                          {formatMoney(
                            tenantBalances?.summary?.totalCredit ?? 0,
                            currency,
                          )}
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                          {tenantBalances?.summary?.tenantsWithCredit ?? 0}{" "}
                          tenant(s) have credit remaining
                        </p>
                      </>
                    )}
                  </div>
                  <icons.dollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
        </div>
      </div>
    </>
  );
}
