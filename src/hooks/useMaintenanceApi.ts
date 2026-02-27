// src/hooks/useMaintenanceApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";
import type {
  MaintenanceFilters,
  FetchRequestsResponse,
  FetchExpensesResponse,
  CreateRequestPayload,
  UpdateStatusPayload,
  AddExpensePayload,
  CreateRequestResponse,
  UpdateStatusResponse,
  AddExpenseResponse,
} from "@/pages/maintenance/types";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const maintenanceKeys = {
  all: ["maintenance"] as const,
  requests: (filters?: MaintenanceFilters) =>
    [...maintenanceKeys.all, "requests", filters] as const,
  expenses: (filters?: MaintenanceFilters) =>
    [...maintenanceKeys.all, "expenses", filters] as const,
};

// ── API Functions ───────────────────────────────────────────────────────────

const fetchMaintenanceRequests = async (
  filters?: MaintenanceFilters,
): Promise<FetchRequestsResponse> => {
  const params = new URLSearchParams();
  if (filters?.buildingId) {
    params.append("buildingId", filters.buildingId);
  }

  const { data } = await api.get<FetchRequestsResponse>(
    `/api/v1/maintenance?${params.toString()}`,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch maintenance requests");
  }

  return data;
};

const updateMaintenanceRequestApi = async (
  payload: { id: string } & Partial<CreateRequestPayload & { cost?: number }>,
): Promise<CreateRequestResponse> => {
  // reusing same response type
  const { data } = await api.patch<CreateRequestResponse>(
    `/api/v1/admin/maintenance/${payload.id}`,
    payload,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to update maintenance request");
  }

  return data;
};

const deleteMaintenanceRequestApi = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/api/v1/admin/maintenance/${id}`,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to delete maintenance request");
  }

  return data;
};

const createMaintenanceRequest = async (
  payload: CreateRequestPayload,
): Promise<CreateRequestResponse> => {
  const { data } = await api.post<CreateRequestResponse>(
    "/api/v1/admin/maintenance",
    payload,
  );

  if (!data.success) {
    console.error(data);
    // throw new Error(data.message || "Failed to create maintenance request");
  }

  return data;
};

const updateMaintenanceStatus = async (
  payload: UpdateStatusPayload,
): Promise<UpdateStatusResponse> => {
  const { data } = await api.patch<UpdateStatusResponse>(
    `/api/v1/admin/maintenance/${payload.id}/status`,
    { status: payload.status },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to update maintenance status");
  }

  return data;
};

const fetchAllExpenses = async (
  filters?: MaintenanceFilters,
): Promise<FetchExpensesResponse> => {
  const params = new URLSearchParams();
  if (filters?.buildingId) {
    params.append("buildingId", filters.buildingId);
  }

  const { data } = await api.get<FetchExpensesResponse>(
    `/api/v1/maintenance/expenses?${params.toString()}`,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch expenses");
  }

  return data;
};

const addMaintenanceExpense = async (
  payload: AddExpensePayload,
): Promise<AddExpenseResponse> => {
  const { data } = await api.post<AddExpenseResponse>(
    `/api/v1/admin/maintenance/${payload.id}/expenses`,
    payload.data,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to add expense");
  }

  return data;
};

// ── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch maintenance requests with optional building filter
 */
export function useMaintenanceRequests(filters?: MaintenanceFilters) {
  return useQuery<FetchRequestsResponse, Error>({
    queryKey: maintenanceKeys.requests(filters),
    queryFn: () => fetchMaintenanceRequests(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch all maintenance expenses with optional building filter
 */
export function useMaintenanceExpenses(filters?: MaintenanceFilters) {
  return useQuery<FetchExpensesResponse, Error>({
    queryKey: maintenanceKeys.expenses(filters),
    queryFn: () => fetchAllExpenses(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create a new maintenance request
 */
export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CreateRequestResponse, Error, CreateRequestPayload>({
    mutationFn: createMaintenanceRequest,
    onSuccess: (response) => {
      // Invalidate all maintenance requests queries
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.all,
      });

      toast({
        title: "Success",
        variant: "success",
        description: "Maintenance request created.",
      });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Update maintenance request status
 */
export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateStatusResponse, Error, UpdateStatusPayload>({
    mutationFn: updateMaintenanceStatus,
    onSuccess: (response, variables) => {
      // Invalidate all maintenance requests queries
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.all,
      });

      toast({
        title: "Status updated",
        variant: "success",
        description: `Request status changed to ${variables.status.replace("_", " ")}.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Add expense to a maintenance request
 */
export function useAddMaintenanceExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<AddExpenseResponse, Error, AddExpensePayload>({
    mutationFn: addMaintenanceExpense,
    onSuccess: (response, variables) => {
      // Invalidate both requests and expenses queries
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.all,
      });

      toast({
        title: "Success",
        variant: "success",
        description: "Expense added successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    },
  });
}
export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: deleteMaintenanceRequestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
      toast({
        title: "Deleted",
        variant: "success",
        description: "Maintenance request has been deleted.",
      });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    CreateRequestResponse,
    Error,
    { id: string } & Partial<CreateRequestPayload & { cost?: number }>
  >({
    mutationFn: updateMaintenanceRequestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
      toast({
        title: "Success",
        variant: "success",
        description: "Maintenance request updated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    },
  });
}
