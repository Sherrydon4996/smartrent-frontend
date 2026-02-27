// src/components/Reports.tsx
import React, { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrentDate } from "@/components/CurrentDate";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import { ReportsOverviewCards } from "./ReportsOverviewCards";
import { ReportsBreakdownCards } from "./ReportsBreakdownCards";
import { icons } from "@/utils/utils";
import { getIconEmoji } from "../buildingPage/utils";
import { useReportsApi } from "@/hooks/useReportsApi";
import {
  generateTenantBalanceReport,
  generatePaymentHistoryReport,
  generateMonthlyIncomeReport,
  generateOutstandingBalancesReport,
  generateAnnualSummaryReport,
} from "@/pages/reports/Pdf";
import { useBuildingsList } from "@/hooks/useBuildingAps";

export function Reports() {
  const { toast } = useToast();
  const currency = useAppSelector((state) => state.settingsQ.currency);

  const [buildingFilter, setBuildingFilter] = useState<string>("all");

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  //Filters object — passed to hook → triggers auto-refetch when changed
  const filters = {
    buildingName: buildingFilter !== "all" ? buildingFilter : undefined,
    month: currentMonth,
    year: currentYear,
  };

  const {
    tenantBalances,
    outstandingBalances,
    monthlyIncome,
    annualSummary,
    paymentHistory,
    fetchPaymentHistory,
    tenantBalancesLoading,
    tenantBalancesFetching,
    monthlyIncomeLoading,
    monthlyIncomeFetching,
    annualSummaryLoading,
    paymentHistoryLoading,
    outstandingBalancesLoading,
  } = useReportsApi(filters);
  const { data } = useBuildingsList();

  const buildings = Array.isArray(data) ? data : [];

  const calculateBreakdowns = useCallback(() => {
    const data = tenantBalances?.data || [];

    let totalExpectedRent = 0;
    let totalPaidRent = 0;
    let totalExpectedWater = 0;
    let totalPaidWater = 0;
    let totalExpectedGarbage = 0;
    let totalPaidGarbage = 0;

    data.forEach((tenant: any) => {
      totalExpectedRent += Number(tenant.monthlyRent) || 0;
      totalPaidRent += Number(tenant.rentPaid) || 0;
      totalExpectedWater += Number(tenant.actualWaterBill) || 0;
      totalPaidWater += Number(tenant.waterPaid) || 0;
      totalExpectedGarbage += Number(tenant.expectedGarbage) || 0;
      totalPaidGarbage += Number(tenant.garbagePaid) || 0;
    });

    return {
      rent: {
        expected: totalExpectedRent,
        paid: totalPaidRent,
        outstanding: Math.max(0, totalExpectedRent - totalPaidRent),
      },
      water: {
        expected: totalExpectedWater,
        paid: totalPaidWater,
        outstanding: Math.max(0, totalExpectedWater - totalPaidWater),
      },
      garbage: {
        expected: totalExpectedGarbage,
        paid: totalPaidGarbage,
        outstanding: Math.max(0, totalExpectedGarbage - totalPaidGarbage),
      },
    };
  }, [tenantBalances]);

  const breakdowns = React.useMemo(() => {
    if (!tenantBalances?.data) return null;
    return calculateBreakdowns();
  }, [tenantBalances, calculateBreakdowns]);

  // ── Download Handlers ─────────────────────────────────────────────────────

  const handleDownloadTenantBalance = () => {
    if (!tenantBalances?.data?.length) {
      toast({
        title: "No Data",
        description: "No tenant balance data available.",
        variant: "destructive",
      });
      return;
    }
    try {
      generateTenantBalanceReport(
        tenantBalances.data,
        tenantBalances.summary ?? {},
        tenantBalances.filters ?? {},
        currency,
      );
      toast({
        title: "Success",
        description: "Tenant balance report downloaded.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: "Could not generate tenant balance PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadOutstandingBalances = () => {
    if (!outstandingBalances?.data?.length) {
      toast({
        title: "No Data",
        description: "No outstanding balances available.",
        variant: "default",
      });
      return;
    }
    try {
      generateOutstandingBalancesReport(
        tenantBalances?.data ?? [],
        tenantBalances?.summary ?? {},
        outstandingBalances.filters ?? {},
        currency,
      );
      toast({
        title: "Success",
        description: "Outstanding balances report downloaded.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not generate outstanding balances PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadMonthlyIncome = async () => {
    try {
      generateMonthlyIncomeReport(
        monthlyIncome?.data ?? [],
        monthlyIncome?.summary ?? {},
        monthlyIncome?.filters ?? {},
        currency,
      );
      toast({
        title: "Success",
        description: "Monthly income report downloaded.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not generate monthly income report.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAnnualSummary = async () => {
    try {
      generateAnnualSummaryReport(
        annualSummary?.data ?? {},
        annualSummary?.filters ?? {},
        currency,
      );
      toast({
        title: "Success",
        description: "Annual summary report downloaded.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not generate annual summary report.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPaymentHistory = async () => {
    try {
      const result = await fetchPaymentHistory();
      // refetch() returns QueryObserverResult, so API response is at result.data
      const response = result?.data;
      generatePaymentHistoryReport(
        response?.data ?? [],
        response?.summary ?? {},
        response?.filters ?? {},
        currency,
      );
      toast({
        title: "Success",
        description: "Payment history report downloaded.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not generate payment history report.",
        variant: "destructive",
      });
    }
  };

  const reportCards = [
    {
      title: "Monthly Income Report",
      description: `Income breakdown for ${currentYear}`,
      icon: icons.trendingUp,
      handler: handleDownloadMonthlyIncome,
      isLoading: !!monthlyIncomeLoading,
    },
    {
      title: "Tenant Payment History",
      description: "All payment transactions",
      icon: icons.fileText,
      handler: handleDownloadPaymentHistory,
      isLoading: !!paymentHistoryLoading,
    },
    {
      title: "Outstanding Balances",
      description: `Pending payments report`,
      icon: icons.calendar,
      handler: handleDownloadOutstandingBalances,
      isLoading: !!outstandingBalancesLoading,
    },
    {
      title: "Tax-Ready Annual Summary",
      description: `Financial summary for ${currentYear}`,
      icon: icons.fileText,
      handler: handleDownloadAnnualSummary,
      isLoading: !!annualSummaryLoading,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Financial reports and analytics
          </p>
        </div>
        <CurrentDate />
      </div>

      {/* Building Filter */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <icons.building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Filter by Building
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-[300px] bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select building" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <icons.building2 className="h-4 w-4" />
                  All Buildings
                </div>
              </SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.name}>
                  <div className="flex items-center gap-3">
                    {getIconEmoji(building.icon)}
                    {building.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(tenantBalancesLoading || tenantBalancesFetching) && (
            <div className="flex items-center gap-2 mt-4 text-sm text-blue-600 dark:text-blue-400">
              <icons.Loader2 className="h-4 w-4 animate-spin" />
              {tenantBalancesLoading ? "Loading reports..." : "Updating..."}
            </div>
          )}
        </CardContent>
      </Card>

      <ReportsOverviewCards
        tenantBalances={tenantBalances}
        buildingFilter={buildingFilter}
        currentMonth={currentMonth}
        isLoading={tenantBalancesLoading || tenantBalancesFetching}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <icons.fileText className="h-5 w-5" />
          Detailed Breakdown by Category
        </h2>
        <ReportsBreakdownCards
          breakdowns={breakdowns}
          tenantBalances={tenantBalances}
          isLoading={tenantBalancesLoading || tenantBalancesFetching}
        />
      </div>

      {/* Report Download Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <icons.Download className="h-5 w-5" />
          Download Reports
        </h2>
        <div className="relative">
          <div
            className={`
              flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory
              scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
              md:grid md:grid-cols-2 md:overflow-x-hidden md:snap-none
            `}
          >
            {reportCards.map((report, index) => {
              const bgColors = [
                "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 border-violet-200 dark:border-violet-800",
                "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/20 border-sky-200 dark:border-sky-800",
                "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border-rose-200 dark:border-rose-800",
                "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800",
              ];

              return (
                <Card
                  key={report.title}
                  className={`
                    flex-shrink-0 w-72 md:w-auto
                    shadow-sm border transition-all hover:shadow-md
                    bg-gradient-to-br ${bgColors[index]}
                    min-w-[260px] snap-start md:min-w-0
                  `}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <report.icon className="h-5 w-5" />
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {report.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={report.handler}
                      disabled={
                        report.isLoading ||
                        tenantBalancesLoading ||
                        tenantBalancesFetching
                      }
                      className="w-full"
                      size="sm"
                    >
                      {report.isLoading ||
                      tenantBalancesLoading ||
                      tenantBalancesFetching ? (
                        <>
                          <icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {tenantBalancesFetching
                            ? "Updating..."
                            : "Generating..."}
                        </>
                      ) : (
                        <>
                          <icons.Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
        </div>
      </div>

      {/* Current Month Tenant Balances */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <icons.fileText className="h-5 w-5" />
            Current Month Tenant Balances
          </CardTitle>
          <CardDescription>
            Detailed tenant-by-tenant balance report for {currentMonth}{" "}
            {currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDownloadTenantBalance}
            disabled={tenantBalancesLoading || tenantBalancesFetching}
            className="w-full"
          >
            {tenantBalancesLoading || tenantBalancesFetching ? (
              <>
                <icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tenantBalancesFetching ? "Updating..." : "Generating..."}
              </>
            ) : (
              <>
                <icons.Download className="mr-2 h-4 w-4" />
                Download Current Month Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
