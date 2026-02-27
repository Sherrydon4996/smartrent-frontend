// hooks/useBuildings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  Building,
  Unit,
  Staff,
  CreateBuildingPayload,
  UpdateBuildingPayload,
  CreateUnitPayload,
  UpdateUnitPayload,
  CreateStaffPayload,
  UpdateStaffPayload,
  CreateBuildingResponse,
  CreateUnitResponse,
  UpdateUnitResponse,
  CreateStaffResponse,
} from "@/pages/buildingPage/utils";
import { api } from "@/Apis/axiosApi";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const buildingsKeys = {
  all: ["buildings"] as const,
  list: ["buildings", "list"] as const,
  detail: (id: string) => ["buildings", id] as const,
  units: (buildingId: string) => ["buildings", buildingId, "units"] as const,
  staff: (buildingId: string) => ["buildings", buildingId, "staff"] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export function useBuildingsList() {
  return useQuery<Building[], Error>({
    queryKey: buildingsKeys.list,
    queryFn: async () => {
      const { data } = await api.get<Building[]>("/api/v1/buildings/full");
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBuildingDetail(buildingId: string | null) {
  return useQuery<Building, Error>({
    queryKey: buildingsKeys.detail(buildingId!),
    queryFn: async () => {
      if (!buildingId) throw new Error("Building ID is required");
      const { data } = await api.get<Building>(
        `/api/v1/buildings/${buildingId}`,
      );
      return data;
    },
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBuildingUnits(buildingId: string | null) {
  return useQuery<Unit[], Error>({
    queryKey: buildingsKeys.units(buildingId!),
    queryFn: async () => {
      if (!buildingId) throw new Error("Building ID is required");
      const { data } = await api.get<Unit[]>(
        `/api/v1/buildings/${buildingId}/units`,
      );
      return data || [];
    },
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useBuildingStaff(buildingId: string | null) {
  return useQuery<Staff[], Error>({
    queryKey: buildingsKeys.staff(buildingId!),
    queryFn: async () => {
      if (!buildingId) throw new Error("Building ID is required");
      const { data } = await api.get<Staff[]>(
        `/api/v1/buildings/${buildingId}/staff`,
      );
      return data || [];
    },
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 2,
  });
}

// ── Building Mutations ──────────────────────────────────────────────────────

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  return useMutation<CreateBuildingResponse, Error, CreateBuildingPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateBuildingResponse>(
        "/api/v1/admin/buildings",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
    },
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; data: UpdateBuildingPayload }>({
    mutationFn: async ({ id, data }) => {
      await api.put(`/api/v1/admin/buildings/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: buildingsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
    },
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/admin/buildings/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: buildingsKeys.detail(id) });
      queryClient.removeQueries({ queryKey: buildingsKeys.units(id) });
      queryClient.removeQueries({ queryKey: buildingsKeys.staff(id) });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
    },
  });
}

// ── Unit Mutations ──────────────────────────────────────────────────────────

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation<Unit, Error, CreateUnitPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateUnitResponse>(
        "/api/v1/admin/buildings/units",
        payload,
      );
      return data.data;
    },
    onSuccess: (newUnit) => {
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.units(newUnit.building_id),
      });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.detail(newUnit.building_id),
      });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation<Unit, Error, { id: string; data: UpdateUnitPayload }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<UpdateUnitResponse>(
        `/api/v1/admin/buildings/units/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (updatedUnit) => {
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.units(updatedUnit.building_id),
      });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.detail(updatedUnit.building_id),
      });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { unitId: string; buildingId: string }>({
    mutationFn: async ({ unitId }) => {
      await api.delete(`/api/v1/admin/buildings/units/${unitId}`);
    },
    onSuccess: (_, { buildingId }) => {
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.units(buildingId),
      });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.detail(buildingId),
      });
    },
  });
}

// ── Staff Mutations ─────────────────────────────────────────────────────────

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation<Staff, Error, CreateStaffPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateStaffResponse>(
        "/api/v1/admin/buildings/staff",
        payload,
      );
      return {
        ...payload,
        id: data.id,
        created_at: new Date().toISOString(),
      } as Staff;
    },
    onSuccess: (newStaff) => {
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.staff(newStaff.building_id),
      });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.detail(newStaff.building_id),
      });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; buildingId: string; data: UpdateStaffPayload }
  >({
    mutationFn: async ({ id, data }) => {
      await api.put(`/api/v1/admin/buildings/staff/${id}`, data);
    },
    onSuccess: (_, { buildingId }) => {
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.staff(buildingId),
      });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.detail(buildingId),
      });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { staffId: string; buildingId: string }>({
    mutationFn: async ({ staffId }) => {
      await api.delete(`/api/v1/admin/buildings/staff/${staffId}`);
    },
    onSuccess: (_, { buildingId }) => {
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.staff(buildingId),
      });
      queryClient.invalidateQueries({ queryKey: buildingsKeys.list });
      queryClient.invalidateQueries({
        queryKey: buildingsKeys.detail(buildingId),
      });
    },
  });
}
