// src/pages/tenantPage/Tenants.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrentDate } from "@/components/CurrentDate";
import { PrintReceipt } from "@/components/PrintReceit";
import { PaymentHistoryModal } from "@/components/PaymentHistoryModal";
import { LoadingSkeleton, LoadingState } from "@/loaders/dataLoader";
import { ErrorState } from "@/errors/dataError";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setBuildingFilter,
  setStatusFilter,
  setSearchTerm,
  setSelectedMonth,
  setSelectedYear,
  setAddDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setEditingTenant,
  setTenantToDelete,
  setReceiptTenant,
  setPaymentHistoryTenant,
} from "@/slices/TenantsSlice";
import { generateYears, MONTHS, icons } from "@/utils/utils";
import { getIconEmoji } from "../buildingPage/utils";

import { TenantTable } from "./TenantTable";
import { TenantEditDialog } from "./TenantEditDialog";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { calculateTenantStatus } from "./utils";
import { TenantAddDialog } from "./TenantAddDialog";

import {
  useTenantsList,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
} from "@/hooks/useTenantsApi";
import type {
  Tenant,
  TenantApiPayload,
  UpdateTenantPayload,
} from "@/pages/TenantPage/types";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { TenantFilters } from "./TenantFilters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recalculatePenalties } from "./utils";

export function Tenants() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Redux State (UI State Only) ──────────────────────────────────────────
  const {
    buildingFilter,
    statusFilter,
    searchTerm,
    selectedMonth,
    selectedYear,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    editingTenant,
    tenantToDelete,
    receiptTenant,
    paymentHistoryTenant,
  } = useAppSelector((state) => state.tenants);

  const currency = useAppSelector((state) => state.settingsQ.currency);

  // ── React Query (Data State) ─────────────────────────────────────────────
  const {
    data: tenantsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching, // ← added for refresh button feedback
  } = useTenantsList({
    month: selectedMonth,
    year: selectedYear,
  });

  const createTenantMutation = useCreateTenant();
  const updateTenantMutation = useUpdateTenant();
  const deleteTenantMutation = useDeleteTenant();

  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();
  const tenants = tenantsData?.records ?? [];

  const unitTypesWithDetails = useMemo(() => {
    const typeMap = new Map<
      string,
      {
        min: number;
        max: number;
        buildings: { name: string; rent: number; emoji: string }[];
      }
    >();
    const settingsBuildings = buildings || [];

    settingsBuildings.forEach((building) => {
      building.unitTypes?.forEach((ut) => {
        const existing = typeMap.get(ut.unit_type_name);
        const buildingInfo = {
          name: building.name,
          rent: ut.monthly_rent,
          emoji: getIconEmoji(building.icon) || "🏢",
        };

        if (existing) {
          typeMap.set(ut.unit_type_name, {
            min: Math.min(existing.min, ut.monthly_rent),
            max: Math.max(existing.max, ut.monthly_rent),
            buildings: [...existing.buildings, buildingInfo],
          });
        } else {
          typeMap.set(ut.unit_type_name, {
            min: ut.monthly_rent,
            max: ut.monthly_rent,
            buildings: [buildingInfo],
          });
        }
      });
    });

    return Array.from(typeMap.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [buildings]);

  const filteredTenants = useMemo(() => {
    if (!tenants || tenants.length === 0) return [];

    return tenants.filter((tenant) => {
      if (!tenant) return false;

      const tenantName = tenant.name || "";
      const houseNumber = tenant.houseNumber || "";
      const mobile = tenant.mobile || "";

      const matchesSearch =
        tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        houseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mobile?.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || tenant.status === statusFilter;

      const matchesBuilding =
        buildingFilter === "all" || tenant.buildingName === buildingFilter;

      return matchesSearch && matchesStatus && matchesBuilding;
    });
  }, [tenants, searchTerm, statusFilter, buildingFilter]);

  //REFRESH PENALTIES
  const recalculatePenaltiesMutation = useMutation({
    mutationFn: recalculatePenalties,
    onSuccess: (data) => {
      toast({
        title: "Penalties Recalculated",
        description: `Updated penalties for ${data.updatedCount} tenant(s)`,
        variant: "success",
      });
      refetch(); // Refresh the tenant list to show updated penalties
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to recalculate penalties",
        variant: "destructive",
      });
    },
  });

  // ── Event Handlers ───────────────────────────────────────────────────────
  const handleRetry = () => {
    refetch();
  };

  const handleSubmitNewTenant = async (values: TenantApiPayload) => {
    await createTenantMutation.mutateAsync(values);
    dispatch(setAddDialogOpen(false));
  };

  const handleEditTenant = (tenant: Tenant) => {
    dispatch(setEditingTenant(tenant));
    dispatch(setEditDialogOpen(true));
  };

  const handleUpdateTenant = async (
    values: TenantApiPayload,
    status: "active" | "left",
  ) => {
    if (!editingTenant) return;

    const payload: UpdateTenantPayload = {
      ...values,
      status,
      monthlyRent: values.monthlyRent || 0,
    };

    await updateTenantMutation.mutateAsync({
      id: editingTenant.id,
      data: payload,
    });

    dispatch(setEditDialogOpen(false));
    dispatch(setEditingTenant(null));
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;

    await deleteTenantMutation.mutateAsync({
      id: tenantToDelete.id,
      name: tenantToDelete.name,
    });

    dispatch(setDeleteDialogOpen(false));
    dispatch(setTenantToDelete(null));
  };

  const handleViewDetails = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  const handlePrintReceipt = (tenant: Tenant) => {
    const status = calculateTenantStatus(tenant);
    if (!status.isPaid) {
      toast({
        title: "Cannot print receipt",
        description: "Receipt can only be printed for fully paid tenants.",
        variant: "destructive",
      });
      return;
    }
    dispatch(setReceiptTenant(tenant));
  };

  // ── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <ErrorState
        error={error?.message || "Failed to load tenants"}
        onRetry={handleRetry}
      />
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const colorSchemes = [
    "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800",
    "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
  ];
  if (buildingsLoading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentDate />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your tenants in one place
          </p>
        </div>
        <TenantAddDialog
          isOpen={isAddDialogOpen}
          onOpenChange={(open) => dispatch(setAddDialogOpen(open))}
          onSubmitDialog={handleSubmitNewTenant}
        />
      </div>

      {/* Month/Year Filter */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <icons.calendar className="w-5 h-5" />
            Filter by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Month
              </Label>
              <Select
                value={selectedMonth}
                onValueChange={(v) => dispatch(setSelectedMonth(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Year
              </Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => dispatch(setSelectedYear(parseInt(v)))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Types Display */}
      {unitTypesWithDetails.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">
              Unit Types & Rent Prices ({currency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {unitTypesWithDetails.map((type, index) => (
                <div
                  key={type.name}
                  className={`p-2 rounded-lg border transition-all hover:shadow-sm ${
                    colorSchemes[index % colorSchemes.length]
                  }`}
                  title={`${type.name} - ${
                    type.buildings.length
                  } building(s): ${type.buildings
                    .map(
                      (b) =>
                        `${b.name} (${currency} ${b.rent.toLocaleString()})`,
                    )
                    .join(", ")}`}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1 mb-1 w-full">
                      <icons.home className="w-3 h-3 text-foreground/70" />
                      <span className="font-semibold text-foreground text-xs truncate text-center">
                        {type.name}
                      </span>
                    </div>

                    <div className="text-center mb-1">
                      {type.min === type.max ? (
                        <div>
                          <span className="text-xs font-bold text-foreground">
                            {currency} {type.min.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-foreground/60 block">
                            /month
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] font-bold text-foreground">
                            {currency} {type.min.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-foreground/60">
                            {" "}
                            to{" "}
                          </span>
                          <span className="text-[11px] font-bold text-foreground">
                            {currency} {type.max.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-foreground/60 block">
                            /month
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1 pt-1 border-t border-foreground/10 w-full">
                      <div className="flex flex-col gap-0.5 items-center">
                        {type.buildings.slice(0, 3).map((building, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 w-full justify-center"
                            title={`${
                              building.name
                            }: ${currency} ${building.rent.toLocaleString()}`}
                          >
                            <span className="text-[10px]">
                              {building.emoji}
                            </span>
                            <span className="text-[9px] font-medium truncate max-w-[80px]">
                              {building.name}
                            </span>
                            {type.buildings.length > 1 && (
                              <span className="text-[9px] text-foreground/60">
                                ({currency} {building.rent.toLocaleString()})
                              </span>
                            )}
                          </div>
                        ))}
                        {type.buildings.length > 3 && (
                          <span className="text-[9px] font-medium text-foreground/60">
                            +{type.buildings.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <TenantFilters
        searchTerm={searchTerm}
        onSearchChange={(v) => dispatch(setSearchTerm(v))}
        statusFilter={statusFilter}
        onStatusChange={(v) => dispatch(setStatusFilter(v))}
        buildingFilter={buildingFilter}
        onBuildingChange={(v) => dispatch(setBuildingFilter(v))}
      />

      {/* Tenants Table Section with Refresh Button */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <icons.Users className="w-5 h-5 text-primary" />
            Current Tenants
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => recalculatePenaltiesMutation.mutate()}
              disabled={recalculatePenaltiesMutation.isPending}
              className="gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 border-amber-200 hover:border-amber-300 dark:border-amber-800"
              title="Recalculate penalties for all active tenants"
            >
              <icons.Calculator
                className={cn(
                  "h-4 w-4",
                  recalculatePenaltiesMutation.isPending && "animate-spin",
                )}
              />
              {recalculatePenaltiesMutation.isPending
                ? "Calculating..."
                : "Recalculate Penalties"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              title="Refresh tenant list"
            >
              <icons.refreshCw
                className={cn("h-4 w-4", isFetching && "animate-spin")}
              />
              {isFetching ? "Refreshing..." : "Refresh Tenants"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <TenantTable
            tenants={filteredTenants}
            onViewDetails={handleViewDetails}
            onEdit={handleEditTenant}
            onDelete={(tenant) => {
              dispatch(setTenantToDelete(tenant));
              dispatch(setDeleteDialogOpen(true));
            }}
            onPrintReceipt={handlePrintReceipt}
            onViewPayments={(tenant) =>
              dispatch(setPaymentHistoryTenant(tenant))
            }
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TenantEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => dispatch(setEditDialogOpen(open))}
        tenant={editingTenant}
        onSubmit={handleUpdateTenant}
      />

      <TenantDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => dispatch(setDeleteDialogOpen(open))}
        tenant={tenantToDelete}
        onConfirm={handleDeleteTenant}
      />

      {receiptTenant && (
        <PrintReceipt
          tenant={receiptTenant}
          isOpen={!!receiptTenant}
          onClose={() => dispatch(setReceiptTenant(null))}
          month={selectedMonth}
          year={selectedYear}
        />
      )}

      {paymentHistoryTenant && (
        <PaymentHistoryModal
          tenant={paymentHistoryTenant}
          isOpen={!!paymentHistoryTenant}
          onClose={() => dispatch(setPaymentHistoryTenant(null))}
        />
      )}
    </div>
  );
}
