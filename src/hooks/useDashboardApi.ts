// src/hooks/useDashboardApi.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MonthlyPaymentsResponse,
  MonthlyPaymentsFilters,
} from "@/pages/dashboard/types";
import { api } from "@/Apis/axiosApi";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const dashboardKeys = {
  all: ["dashboard"] as const,
  monthlyPayments: (filters: MonthlyPaymentsFilters) =>
    [...dashboardKeys.all, "monthlyPayments", filters] as const,
};

// ── API Functions ───────────────────────────────────────────────────────────

const fetchMonthlyPaymentsByMonth = async (
  filters: MonthlyPaymentsFilters,
): Promise<MonthlyPaymentsResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const { data } = await api.get<MonthlyPaymentsResponse>(
    `/api/v1/reports/monthly-payments-detail?${params.toString()}`,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch monthly payments");
  }

  return data;
};

// ── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch monthly payment details for dashboard
 */
export function useMonthlyPaymentsByMonth(filters: MonthlyPaymentsFilters) {
  return useQuery<MonthlyPaymentsResponse, Error>({
    queryKey: dashboardKeys.monthlyPayments(filters),
    queryFn: () => fetchMonthlyPaymentsByMonth(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ── Helper Functions ────────────────────────────────────────────────────────

/**
 * Calculate dashboard statistics from monthly payments data
 */
export function useDashboardStats(
  monthlyPaymentsData: MonthlyPaymentsResponse | undefined,
  annualSummary: any,
  currency: string,
  selectedMonth: string,
  selectedYear: number,
) {
  if (!monthlyPaymentsData) {
    return [];
  }

  const summary = monthlyPaymentsData.summary;
  const totalTenants = summary?.totalTenants || 0;

  const thisMonthCollected =
    (summary?.totalRentPaid || 0) +
    (summary?.totalWaterPaid || 0) +
    (summary?.totalGarbagePaid || 0) +
    (summary?.totalPenaltiesPaid || 0);

  const thisMonthPayments =
    monthlyPaymentsData.data?.filter(
      (payment) => payment.rentPaid > 0 || payment.waterPaid > 0,
    ).length || 0;

  const totalRentThisYear = annualSummary?.data?.income?.totalIncome || 0;
  const totalRentAllTime = annualSummary?.data?.allTime?.totalIncome || 0;
  const overdueAmount = summary?.totalBalanceDue || 0;
  const overdueTenants = summary?.overdueTenants || 0;

  return [
    {
      title: "Active Tenants",
      value: totalTenants.toString(),
      change: `${selectedMonth} ${selectedYear}`,
      trend: "up" as const,
      icon: "Users",
      color: "blue" as const,
    },
    {
      title: `${selectedMonth} Collections`,
      value: thisMonthCollected,
      change: `${thisMonthPayments} payments`,
      trend: (thisMonthCollected > 0 ? "up" : "neutral") as const,
      icon: "CalendarDays",
      color: "green" as const,
    },
    {
      title: "Collected This Year",
      value: totalRentThisYear,
      change: `${annualSummary?.data?.monthlyBreakdown?.length || 0} months`,
      trend: "up" as const,
      icon: "DollarSign",
      color: "green" as const,
    },
    {
      title: "Total Collections",
      value: totalRentAllTime,
      change: "All time",
      trend: "neutral" as const,
      icon: "TrendingUp",
      color: "blue" as const,
    },
    {
      title: "Overdue Amount",
      value: overdueAmount,
      change: `${overdueTenants} tenants`,
      trend: (overdueAmount > 0 ? "down" : "neutral") as const,
      icon: "AlertTriangle",
      color: "red" as const,
    },
  ];
}
