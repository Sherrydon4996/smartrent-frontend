// src/hooks/useTenantPaymentApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";
import type {
  TenantMonthlyRecord,
  FetchMonthlyPaymentsParams,
  FetchTenantMonthlyRecordsParams,
  UpsertTransactionParams,
  MonthlyPaymentsResponse,
  UpsertTransactionResponse,
} from "@/pages/monthlyUpdates/types";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const tenantPaymentKeys = {
  all: ["tenantPayments"] as const,
  monthlyPayments: (params: FetchMonthlyPaymentsParams) =>
    [...tenantPaymentKeys.all, "monthly", params] as const,
  tenantRecords: (tenantId: string) =>
    [...tenantPaymentKeys.all, "tenant", tenantId] as const,
  allMonthlyRecords: (params: FetchMonthlyPaymentsParams) =>
    [...tenantPaymentKeys.all, "allMonthly", params] as const,
};

// ── API Functions ───────────────────────────────────────────────────────────

const fetchMonthlyPayments = async (
  params: FetchMonthlyPaymentsParams,
): Promise<TenantMonthlyRecord[]> => {
  const { data } = await api.get<MonthlyPaymentsResponse>(
    `/api/v1/transactions/getTransactions/monthly`,
    {
      params: {
        month: params.month,
        year: params.year,
      },
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch records");
  }

  return data.records || [];
};

const fetchTenantMonthlyRecords = async (
  params: FetchTenantMonthlyRecordsParams,
): Promise<TenantMonthlyRecord[]> => {
  const { data } = await api.get<MonthlyPaymentsResponse>(
    `/api/v1/tenants/${params.tenantId}/monthly-records`,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch tenant records");
  }

  return data.records || [];
};

const fetchAllMonthlyRecords = async (
  params: FetchMonthlyPaymentsParams,
): Promise<TenantMonthlyRecord[]> => {
  const { data } = await api.get<MonthlyPaymentsResponse>(
    `/api/v1/tenants/getAllMonthlyRecords`,
    {
      params: {
        month: params.month,
        year: params.year,
      },
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch all monthly records");
  }

  return data.records || [];
};

const upsertTransaction = async (
  params: UpsertTransactionParams,
): Promise<UpsertTransactionResponse> => {
  const { data } = await api.post<UpsertTransactionResponse>(
    "/api/v1/admin/transactions/upsert",
    {
      tenantId: params.tenantId,
      transaction: params.transaction,
      record: params.record,
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to save transaction");
  }

  return data;
};

// ── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch monthly payment records for all tenants in a specific month/year
 */
export function useMonthlyPayments(params: FetchMonthlyPaymentsParams) {
  return useQuery<TenantMonthlyRecord[], Error>({
    queryKey: tenantPaymentKeys.monthlyPayments(params),
    queryFn: () => fetchMonthlyPayments(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch all monthly records for a specific tenant across all months
 */
export function useTenantMonthlyRecords(tenantId: string | null) {
  return useQuery<TenantMonthlyRecord[], Error>({
    queryKey: tenantPaymentKeys.tenantRecords(tenantId!),
    queryFn: () => fetchTenantMonthlyRecords({ tenantId: tenantId! }),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Fetch all monthly records for all tenants in a specific month/year
 * (Alternative to useMonthlyPayments with different endpoint)
 */
export function useAllMonthlyRecords(params: FetchMonthlyPaymentsParams) {
  return useQuery<TenantMonthlyRecord[], Error>({
    queryKey: tenantPaymentKeys.allMonthlyRecords(params),
    queryFn: () => fetchAllMonthlyRecords(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create or update a tenant transaction
 */
export function useUpsertTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpsertTransactionResponse, Error, UpsertTransactionParams>(
    {
      mutationFn: upsertTransaction,
      onSuccess: (response, variables) => {
        // Invalidate all monthly payment queries for this month/year
        queryClient.invalidateQueries({
          queryKey: tenantPaymentKeys.monthlyPayments({
            month: variables.record.month,
            year: variables.record.year,
          }),
        });

        // Invalidate all monthly records queries for the same month/year
        queryClient.invalidateQueries({
          queryKey: tenantPaymentKeys.allMonthlyRecords({
            month: variables.record.month,
            year: variables.record.year,
          }),
        });

        // Invalidate specific tenant records
        queryClient.invalidateQueries({
          queryKey: tenantPaymentKeys.tenantRecords(variables.tenantId),
        });

        // Optimistically update the cache if needed
        queryClient.setQueryData<TenantMonthlyRecord[]>(
          tenantPaymentKeys.monthlyPayments({
            month: variables.record.month,
            year: variables.record.year,
          }),
          (oldData) => {
            if (!oldData) return oldData;

            const updatedRecord = response.record;
            const index = oldData.findIndex(
              (r) =>
                r.tenantId === updatedRecord.tenantId &&
                r.month === updatedRecord.month &&
                r.year === updatedRecord.year,
            );

            if (index >= 0) {
              const newData = [...oldData];
              newData[index] = updatedRecord;
              return newData;
            }

            return [...oldData, updatedRecord];
          },
        );

        toast({
          title: "Payment updated",
          variant: "success",
          description: "Transaction has been saved successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Failed to save payment",
          description:
            error.response?.data?.message ||
            error.message ||
            "Something went wrong",
          variant: "destructive",
        });
      },
    },
  );
}

// ── Helper Hooks ────────────────────────────────────────────────────────────

/**
 * Calculate payment status for a record
 */
export function usePaymentStatus(record: TenantMonthlyRecord | null) {
  if (!record) {
    return {
      isPaidFull: false,
      isPartialPaid: false,
      isNotPaid: true,
      totalDue: 0,
      totalAppliedThisMonth: 0,
      advanceThisMonth: 0,
      balanceDue: 0,
    };
  }

  const totalDue =
    (record.monthlyRent || 0) +
    (record.waterBill || 0) +
    (record.garbageBill || 0) +
    (record.penalties || 0);

  const totalAppliedThisMonth =
    (record.effectiveRentPaid || 0) +
    (record.effectiveWaterPaid || 0) +
    (record.effectiveGarbagePaid || 0) +
    (record.effectivePenaltiesPaid || 0);

  const isPaidFull = totalAppliedThisMonth >= totalDue;
  const isPartialPaid = totalAppliedThisMonth > 0 && !isPaidFull;
  const isNotPaid = totalAppliedThisMonth === 0;

  const advanceThisMonth = record.advanceBalance || 0;
  const balanceDue =
    record.balanceDue || Math.max(0, totalDue - totalAppliedThisMonth);

  return {
    isPaidFull,
    isPartialPaid,
    isNotPaid,
    totalDue,
    totalAppliedThisMonth,
    advanceThisMonth,
    balanceDue,
  };
}
