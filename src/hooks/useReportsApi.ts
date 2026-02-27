// src/hooks/useReportsApi.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ReportFilters } from "@/pages/reports/utils";
import { api } from "@/Apis/axiosApi";

// ── API Fetch Functions ──────────────────────────────────────────────────────

const fetchTenantBalanceReport = async (filters: ReportFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const res = await api.get(`/api/v1/reports/tenant-balances?${params}`);
  return res.data;
};

const fetchPaymentHistoryReport = async (filters: ReportFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const res = await api.get(`/api/v1/reports/payment-history?${params}`);
  return res.data;
};

const fetchMonthlyIncomeReport = async (filters: ReportFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const res = await api.get(`/api/v1/reports/monthly-income?${params}`);
  return res.data;
};

const fetchOutstandingBalancesReport = async (filters: ReportFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const res = await api.get(`/api/v1/reports/outstanding-balances?${params}`);
  return res.data;
};

const fetchAnnualSummaryReport = async (filters: ReportFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const res = await api.get(`/api/v1/reports/annual-summary?${params}`);
  return res.data;
};

// ── Main Hook ────────────────────────────────────────────────────────────────

export const useReportsApi = (filters: ReportFilters = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Tenant Balances (main monthly view)
  const tenantBalancesQuery = useQuery({
    queryKey: ["reports", "tenantBalances", filters],
    queryFn: () => fetchTenantBalanceReport(filters),
    staleTime: 0, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Outstanding Balances
  const outstandingBalancesQuery = useQuery({
    queryKey: ["reports", "outstandingBalances", filters],
    queryFn: () => fetchOutstandingBalancesReport(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Monthly Income
  const monthlyIncomeQuery = useQuery({
    queryKey: ["reports", "monthlyIncome", filters],
    queryFn: () => fetchMonthlyIncomeReport(filters),
    staleTime: 10 * 60 * 1000,
  });

  // Annual Summary
  const annualSummaryQuery = useQuery({
    queryKey: ["reports", "annualSummary", filters],
    queryFn: () => fetchAnnualSummaryReport(filters),
    staleTime: 30 * 60 * 1000, // longer for annual
  });

  // Payment History – lazy / on-demand only
  const paymentHistoryQuery = useQuery({
    queryKey: ["reports", "paymentHistory", filters],
    queryFn: () => fetchPaymentHistoryReport({ ...filters, limit: 500 }),
    enabled: false, // only run when explicitly refetched
    staleTime: Infinity,
  });

  // Helper to manually trigger payment history fetch (used in download)
  const fetchPaymentHistory = () => paymentHistoryQuery.refetch();

  return {
    // Main data
    tenantBalances: tenantBalancesQuery.data,
    tenantBalancesLoading: tenantBalancesQuery.isLoading,
    tenantBalancesFetching: tenantBalancesQuery.isFetching,
    tenantBalancesError: tenantBalancesQuery.error,

    outstandingBalances: outstandingBalancesQuery.data,
    outstandingBalancesLoading: outstandingBalancesQuery.isLoading,
    outstandingBalancesFetching: outstandingBalancesQuery.isFetching,

    monthlyIncome: monthlyIncomeQuery.data,
    monthlyIncomeLoading: monthlyIncomeQuery.isLoading,
    monthlyIncomeFetching: monthlyIncomeQuery.isFetching,

    annualSummary: annualSummaryQuery.data,
    annualSummaryLoading: annualSummaryQuery.isLoading,
    annualSummaryFetching: annualSummaryQuery.isFetching,

    paymentHistory: paymentHistoryQuery.data,
    paymentHistoryLoading: paymentHistoryQuery.isLoading,

    // Helpers
    fetchPaymentHistory,

    // Aggregate loading states
    isLoading:
      tenantBalancesQuery.isLoading ||
      outstandingBalancesQuery.isLoading ||
      monthlyIncomeQuery.isLoading ||
      annualSummaryQuery.isLoading,
    isFetching:
      tenantBalancesQuery.isFetching ||
      outstandingBalancesQuery.isFetching ||
      monthlyIncomeQuery.isFetching ||
      annualSummaryQuery.isFetching ||
      paymentHistoryQuery.isFetching,
  };
};
