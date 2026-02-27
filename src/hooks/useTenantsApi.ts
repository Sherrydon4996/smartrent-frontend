// src/hooks/useTenantsApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";
import type {
  Tenant,
  FetchTenantsParams,
  FetchTenantsResponse,
  TenantApiPayload,
  UpdateTenantPayload,
  CreateTenantResponse,
  UpdateTenantResponse,
  DeleteTenantResponse,
} from "@/pages/TenantPage/types";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const tenantsKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantsKeys.all, "list"] as const,
  list: (filters: FetchTenantsParams) =>
    [...tenantsKeys.lists(), filters] as const,
  detail: (id: string) => [...tenantsKeys.all, "detail", id] as const,
};

// ── API Functions ───────────────────────────────────────────────────────────

const fetchTenants = async (
  params: FetchTenantsParams,
): Promise<FetchTenantsResponse> => {
  const { data } = await api.get<FetchTenantsResponse>(
    `/api/v1/tenants/getTenants`,
    {
      params: {
        month: params.month,
        year: params.year,
      },
    },
  );
  return data;
};

const createTenant = async (
  payload: TenantApiPayload,
): Promise<CreateTenantResponse> => {
  const { data } = await api.post<CreateTenantResponse>(
    "/api/v1/admin/tenants/addNewTenant",
    payload,
  );
  return data;
};

const updateTenant = async (
  tenantId: string,
  payload: UpdateTenantPayload,
): Promise<UpdateTenantResponse> => {
  const { data } = await api.put<UpdateTenantResponse>(
    `/api/v1/admin/tenants/updateTenant/${tenantId}`,
    payload,
  );
  return data;
};

const deleteTenant = async (
  tenantId: string,
): Promise<DeleteTenantResponse> => {
  const { data } = await api.delete<DeleteTenantResponse>(
    `/api/v1/admin/tenants/deleteTenant/${tenantId}`,
  );
  return data;
};

// ── Queries ─────────────────────────────────────────────────────────────────

export function useTenantsList(params: FetchTenantsParams) {
  return useQuery<FetchTenantsResponse, Error>({
    queryKey: tenantsKeys.list(params),
    queryFn: () => fetchTenants(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CreateTenantResponse, Error, TenantApiPayload>({
    mutationFn: createTenant,
    onSuccess: (response, variables) => {
      // Invalidate all tenant lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });

      toast({
        title: "Tenant added",
        variant: "success",
        description: `${response.data.name} has been added successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add tenant",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    UpdateTenantResponse,
    Error,
    { id: string; data: UpdateTenantPayload }
  >({
    mutationFn: ({ id, data }) => updateTenant(id, data),
    onSuccess: (response, variables) => {
      // Invalidate all tenant lists
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });

      // Invalidate specific tenant detail if we had one
      queryClient.invalidateQueries({
        queryKey: tenantsKeys.detail(variables.id),
      });

      const expensesMessage =
        variables.data.expenses && variables.data.expenses > 0
          ? ` New expenses added.`
          : "";

      toast({
        title: "Tenant updated",
        variant: "success",
        description: `${response.data.name} has been updated successfully.${expensesMessage}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update tenant",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DeleteTenantResponse, Error, { id: string; name: string }>(
    {
      mutationFn: ({ id }) => deleteTenant(id),
      onSuccess: (response, variables) => {
        // Invalidate all tenant lists
        queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });

        // Remove specific tenant detail from cache
        queryClient.removeQueries({
          queryKey: tenantsKeys.detail(variables.id),
        });

        toast({
          title: "Tenant deleted",
          description: `${variables.name} has been deleted successfully.`,
          variant: "success",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Failed to delete tenant",
          description: error.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
      },
    },
  );
}
