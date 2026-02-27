// src/hooks/useSettingsApi.ts
import { api } from "@/Apis/axiosApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type {
  Building,
  BuildingUnitConfig,
  User,
  Penalty,
} from "@/pages/settingsQ/types"; // Assuming types are kept here or moved to a types file

const fetchBuildingsWithUnitTypes = async (): Promise<Building[]> => {
  const res = await api.get<{ success: boolean; records: Building[] }>(
    "/api/v1/settings/buildings-with-unit-types",
  );
  return res.data.records || [];
};

const addUnitTypeToBuilding = async (data: {
  building_id: string;
  name: string;
  monthly_rent: number;
}): Promise<BuildingUnitConfig> => {
  const res = await api.post<{ success: boolean; data: BuildingUnitConfig }>(
    "/api/v1/admin/settings/building-unit-types",
    data,
  );
  return res.data.data;
};

const updateBuildingUnitType = async (data: {
  id: string;
  name?: string;
  monthly_rent?: number;
}): Promise<BuildingUnitConfig> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: BuildingUnitConfig }>(
    `/api/v1/admin/settings/building-unit-types/${id}`,
    payload,
  );
  return res.data.data;
};

const removeUnitTypeFromBuilding = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/settings/building-unit-types/${id}`);
  return id;
};

const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get<{ success: boolean; records: User[] }>(
    "/api/v1/admin/users/fetchAll",
  );
  return res.data.records || [];
};

const addUser = async (data: Partial<User>): Promise<User> => {
  const res = await api.post<{ success: boolean; data: User }>(
    "/api/v1/admin/users/create",
    data,
  );
  return res.data.data;
};

const updateUser = async (
  data: { id: string } & Partial<User>,
): Promise<User> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: User }>(
    `/api/v1/admin/users/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deleteUser = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/users/delete/${id}`);
  return id;
};

const suspendUser = async (id: string): Promise<User> => {
  const res = await api.put<{ success: boolean; data: User }>(
    `/api/v1/admin/users/${id}/suspend`,
  );
  return res.data.data;
};

const unsuspendUser = async (id: string): Promise<User> => {
  const res = await api.put<{ success: boolean; data: User }>(
    `/api/v1/admin/users/${id}/unsuspend`,
  );
  return res.data.data;
};

const fetchPenalties = async (): Promise<Penalty[]> => {
  const res = await api.get<{ success: boolean; records: Penalty[] }>(
    "/api/v1/penalties/get",
  );
  return res.data.records || [];
};

const createPenalty = async (data: {
  building_id: string;
  percentage: number;
}): Promise<Penalty> => {
  const res = await api.post<{ success: boolean; data: Penalty }>(
    "/api/v1/admin/penalties/create",
    data,
  );
  return res.data.data;
};

const updatePenalty = async (data: {
  id: string;
  percentage: number;
}): Promise<Penalty> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: Penalty }>(
    `/api/v1/admin/penalties/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deletePenalty = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/penalties/delete/${id}`);
  return id;
};

export const useSettingsApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: buildings = [],
    isLoading: buildingsLoading,
    error: buildingsError,
  } = useQuery({
    queryKey: ["buildings"],
    queryFn: fetchBuildingsWithUnitTypes,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const {
    data: penalties = [],
    isLoading: penaltiesLoading,
    error: penaltiesError,
  } = useQuery({
    queryKey: ["penalties"],
    queryFn: fetchPenalties,
  });

  const addUnitTypeMutation = useMutation({
    mutationFn: addUnitTypeToBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to add unit type",
        variant: "destructive",
      });
    },
  });

  const updateUnitTypeMutation = useMutation({
    mutationFn: updateBuildingUnitType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description:
          err.response?.data?.message || "Failed to update unit type",
        variant: "destructive",
      });
    },
  });

  const removeUnitTypeMutation = useMutation({
    mutationFn: removeUnitTypeFromBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description:
          err.response?.data?.message || "Failed to remove unit type",
        variant: "destructive",
      });
    },
  });

  const addUserMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: unsuspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to unsuspend user",
        variant: "destructive",
      });
    },
  });

  const createPenaltyMutation = useMutation({
    mutationFn: createPenalty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] }); // Since buildings might be affected indirectly
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to create penalty",
        variant: "destructive",
      });
    },
  });

  const updatePenaltyMutation = useMutation({
    mutationFn: updatePenalty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to update penalty",
        variant: "destructive",
      });
    },
  });

  const deletePenaltyMutation = useMutation({
    mutationFn: deletePenalty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (err: any) => {
      toast({
        title: err?.response?.data?.code,
        description: err.response?.data?.message || "Failed to delete penalty",
        variant: "destructive",
      });
    },
  });

  return {
    buildings,
    buildingsLoading,
    buildingsError,
    users,
    usersLoading,
    usersError,
    penalties,
    penaltiesLoading,
    penaltiesError,
    addUnitType: addUnitTypeMutation.mutateAsync,
    updateUnitType: updateUnitTypeMutation.mutateAsync,
    removeUnitType: removeUnitTypeMutation.mutateAsync,
    addUser: addUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    suspendUser: suspendUserMutation.mutateAsync,
    unsuspendUser: unsuspendUserMutation.mutateAsync,
    createPenalty: createPenaltyMutation.mutateAsync,
    updatePenalty: updatePenaltyMutation.mutateAsync,
    deletePenalty: deletePenaltyMutation.mutateAsync,
  };
};
