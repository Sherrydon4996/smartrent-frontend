import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tenant } from "./types";
import { cn } from "@/lib/utils";
import { tenantFormSchema, TenantFormValues, TenantApiPayload } from "./utils";
import { formatMoney, icons } from "@/utils/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getIconEmoji } from "../buildingPage/utils";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { useBuildingsList } from "@/hooks/useBuildingAps";
import { LoadingDataState } from "@/loaders/dataLoader";

interface TenantEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSubmit: (
    values: TenantApiPayload,
    status: "active" | "left",
  ) => Promise<void>;
}

export function TenantEditDialog({
  isOpen,
  onOpenChange,
  tenant,
  onSubmit,
}: TenantEditDialogProps) {
  const dispatch = useAppDispatch();
  const [editTenantStatus, setEditTenantStatus] = React.useState<
    "active" | "left"
  >("active");

  const [hasChanges, setHasChanges] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currency = useAppSelector((state) => state.settingsQ.currency);
  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();
  const { data } = useBuildingsList();

  const settingsBuildings = buildings ?? [];
  const buildingsWithUnits = data ?? [];

  const editForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
  });

  const { watch, setValue, setError, clearErrors } = editForm;
  const buildingId = watch("buildingId");
  const houseTypeId = watch("houseTypeId");
  const houseNumber = watch("houseNumber");

  const selectedSettingsBuilding = settingsBuildings.find(
    (b) => b.id === buildingId,
  );
  const selectedBuildingWithUnits = buildingsWithUnits.find(
    (b) => b.id === buildingId,
  );

  // Initialize form when tenant changes
  React.useEffect(() => {
    if (tenant && settingsBuildings.length > 0) {
      setEditTenantStatus(tenant.status);

      const building = settingsBuildings.find(
        (b) => b.name === tenant.buildingName,
      );

      const unitType = building?.unitTypes?.find(
        (ut) => ut.unit_type_name === tenant.houseSize,
      );

      editForm.reset({
        name: tenant.name,
        mobile: tenant.mobile,
        email: tenant.email || "",
        nextOfKinName: tenant.nextOfKinName || "",
        nextOfKinMobile: tenant.nextOfKinMobile || "",
        houseNumber: tenant.houseNumber,
        buildingId: building?.id || "",
        houseTypeId: unitType?.id || "",
        area: tenant.area || "",
        depositPaid: tenant.depositPaid || 0,
        garbageBill: tenant.garbageBill || 150,
        expenses: undefined,
      });

      setHasChanges(false);
    }
  }, [tenant, editForm, buildings, settingsBuildings]);

  // Track changes
  React.useEffect(() => {
    const subscription = editForm.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [editForm]);

  // Validate house number occupancy (when changing houses)
  React.useEffect(() => {
    if (buildingId && houseTypeId && houseNumber && tenant) {
      const isSameBuilding =
        selectedSettingsBuilding?.name === tenant.buildingName;
      const isSameHouse = houseNumber === tenant.houseNumber;

      if (isSameBuilding && isSameHouse) {
        clearErrors("houseNumber");
        return;
      }

      const selectedUnitType = selectedSettingsBuilding?.unitTypes?.find(
        (ut) => ut.id === houseTypeId,
      );
      const actualTypeId = selectedUnitType?.unit_type_id;
      const unit = selectedBuildingWithUnits?.units.find(
        (u) => u.unit_number === houseNumber && u.unit_type_id === actualTypeId,
      );

      if (!unit) {
        setError("houseNumber", {
          message: "No such house number for this type in the building",
        });
      } else if (unit.is_occupied) {
        setError("houseNumber", {
          message: `House ${houseNumber} is already occupied. Please select another unit.`,
        });
      } else {
        clearErrors("houseNumber");
      }
    }
  }, [
    buildingId,
    houseTypeId,
    houseNumber,
    selectedBuildingWithUnits,
    selectedSettingsBuilding,
    tenant,
    setError,
    clearErrors,
  ]);

  const handleSubmit = async (values: TenantFormValues) => {
    if (!hasChanges && editTenantStatus === tenant?.status) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedBuilding = settingsBuildings.find(
        (b) => b.id === values.buildingId,
      );
      const selectedUnitType = selectedBuilding?.unitTypes?.find(
        (ut) => ut.id === values.houseTypeId,
      );

      if (!selectedBuilding || !selectedUnitType) {
        console.error("Building or unit type not found");
        return;
      }

      const apiPayload: TenantApiPayload = {
        name: values.name,
        mobile: values.mobile,
        email: values.email,
        nextOfKinName: values.nextOfKinName,
        nextOfKinMobile: values.nextOfKinMobile,
        houseNumber: values.houseNumber,
        buildingName: selectedBuilding.name,
        houseSize: selectedUnitType.unit_type_name,
        area: values.area,
        depositPaid: values.depositPaid,
        garbageBill: values.garbageBill || 150,
        monthlyRent: selectedUnitType.monthly_rent,
        status: editTenantStatus,
        expenses: values.expenses,
      };

      await onSubmit(apiPayload, editTenantStatus);
      setHasChanges(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tenant) return null;

  let availableUnits = selectedBuildingWithUnits?.units || [];
  if (houseTypeId) {
    const selectedUnitType = selectedSettingsBuilding?.unitTypes?.find(
      (ut) => ut.id === houseTypeId,
    );
    const actualTypeId = selectedUnitType?.unit_type_id;
    availableUnits = availableUnits.filter(
      (u) => u.unit_type_id === actualTypeId,
    );
  }

  const currentUnit = availableUnits.find(
    (u) => u.unit_number === tenant.houseNumber,
  );

  availableUnits = availableUnits.sort((a, b) =>
    a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }),
  );

  if (buildingsLoading)
    return <LoadingDataState title="loading..." text="fetching buildings" />;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tenant</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            {/* Status Update Section */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <Label className="text-sm font-medium">Current Status</Label>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      editTenantStatus === "active"
                        ? "bg-success/20 text-success"
                        : "bg-muted-foreground/20 text-muted-foreground",
                    )}
                  >
                    {editTenantStatus === "active" ? "Active" : "Left"}
                  </span>
                  {tenant.leavingDate && (
                    <span className="text-xs text-muted-foreground">
                      Left on:{" "}
                      {new Date(tenant.leavingDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    editTenantStatus === "active" ? "default" : "outline"
                  }
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditTenantStatus("active");
                    setHasChanges(true);
                  }}
                >
                  Mark as Active
                </Button>
                <Button
                  type="button"
                  variant={
                    editTenantStatus === "left" ? "destructive" : "outline"
                  }
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditTenantStatus("left");
                    setHasChanges(true);
                  }}
                >
                  Mark as Left
                </Button>
              </div>
              {editTenantStatus === "left" && tenant.status === "active" && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-xs text-warning-foreground">
                    <strong>Note:</strong> Leaving date will be set to today
                    when you save. All cumulative expenses will be reset to 0.
                  </p>
                </div>
              )}
            </div>

            {/* Current Expenses Display */}
            {tenant.expenses !== undefined && tenant.expenses > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <icons.dollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Current Total Expenses
                  </Label>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatMoney(tenant.expenses, currency)}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                  Accumulated since entry date
                </p>
              </div>
            )}

            {/* Name and Mobile */}
            {/* Name, Mobile, Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Next of Kin */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={editForm.control}
                name="nextOfKinName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next of Kin Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="nextOfKinMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next of Kin Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Building Selection */}
            <FormField
              control={editForm.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("houseTypeId", "");
                      setValue("houseNumber", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {settingsBuildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          <span className="flex items-center gap-2">
                            <span>{getIconEmoji(building.icon)}</span>
                            <span>{building.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* House Type Selection */}
            <FormField
              control={editForm.control}
              name="houseTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Type/Size *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("houseNumber", "");
                    }}
                    value={field.value}
                    disabled={!buildingId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !buildingId
                              ? "Select building first"
                              : "Select house type"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedSettingsBuilding?.unitTypes?.length ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No unit types configured for this building
                        </div>
                      ) : (
                        selectedSettingsBuilding.unitTypes.map((ut) => (
                          <SelectItem key={ut.id} value={ut.id}>
                            {ut.unit_type_name} ({currency}{" "}
                            {ut.monthly_rent.toLocaleString()}/month)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* House Number Selection */}
            <FormField
              control={editForm.control}
              name="houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Number *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      !buildingId || !houseTypeId || availableUnits.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !buildingId
                              ? "Select building first"
                              : !houseTypeId
                                ? "Select house type first"
                                : availableUnits.length === 0
                                  ? "No units available"
                                  : "Select house number"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUnits.map((unit) => {
                        const isCurrentUnit =
                          unit.unit_number === tenant.houseNumber;
                        const isOccupied = unit.is_occupied && !isCurrentUnit;

                        return (
                          <SelectItem
                            key={unit.id}
                            value={unit.unit_number}
                            className={
                              isOccupied
                                ? "text-red-500"
                                : isCurrentUnit
                                  ? "text-blue-600 font-medium"
                                  : "text-green-600"
                            }
                          >
                            {unit.unit_number}{" "}
                            <span className="text-xs">
                              {isCurrentUnit
                                ? "(Current)"
                                : isOccupied
                                  ? "(Occupied)"
                                  : "(Vacant)"}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Area */}
            <FormField
              control={editForm.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area/Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Garbage Bill */}
            <FormField
              control={editForm.control}
              name="garbageBill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garbage Bill</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="150"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Current: {formatMoney(tenant.garbageBill || 150, currency)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add Expenses Field */}
            <FormField
              control={editForm.control}
              name="expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add New Expenses (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {tenant.expenses && tenant.expenses > 0
                      ? `Will be added to current expenses of ${formatMoney(
                          tenant.expenses,
                          currency,
                        )}`
                      : "Enter any new expenses to add for this tenant"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={
                isSubmitting ||
                (!hasChanges && editTenantStatus === tenant?.status)
              }
            >
              {isSubmitting ? (
                <>
                  <icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : !hasChanges && editTenantStatus === tenant?.status ? (
                "No Changes Made"
              ) : (
                "Update Tenant"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
