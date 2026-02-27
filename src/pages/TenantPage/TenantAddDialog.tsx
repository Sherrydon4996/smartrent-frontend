import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/form";
import { formatMoney, icons } from "@/utils/utils";
import { tenantFormSchema, TenantFormValues, TenantApiPayload } from "./utils";
import { useAppSelector } from "@/store/hooks";
import { getIconEmoji } from "../buildingPage/utils";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { useBuildingsList } from "@/hooks/useBuildingAps";
import { LoadingDataState } from "@/loaders/dataLoader";

interface TenantAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitDialog: (values: TenantApiPayload) => Promise<void>;
}

export function TenantAddDialog({
  isOpen,
  onOpenChange,
  onSubmitDialog,
}: TenantAddDialogProps) {
  const currency = useAppSelector((state) => state.settingsQ.currency);

  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();
  const { data } = useBuildingsList();
  const settingsBuildings = buildings ?? [];
  const buildingsWithUnits = data ?? [];

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      nextOfKinName: "",
      nextOfKinMobile: "",
      houseNumber: "",
      houseTypeId: "",
      area: "",
      buildingId: "",
      depositPaid: 0,
      garbageBill: 150,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { watch, setError, clearErrors, setValue } = form;
  const buildingId = watch("buildingId");
  const houseTypeId = watch("houseTypeId");
  const houseNumber = watch("houseNumber");

  const selectedSettingsBuilding = settingsBuildings.find(
    (b) => b.id === buildingId,
  );
  const selectedBuildingWithUnits = buildingsWithUnits.find(
    (b) => b.id === buildingId,
  );

  const calculateDeposit = (typeConfigId: string) => {
    if (!selectedSettingsBuilding) return 0;
    const selectedType = selectedSettingsBuilding.unitTypes?.find(
      (ut) => ut.id === typeConfigId,
    );
    return selectedType?.monthly_rent || 0;
  };

  // Validate house number occupancy
  React.useEffect(() => {
    if (buildingId && houseTypeId && houseNumber) {
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
          message: `House ${houseNumber} in ${selectedSettingsBuilding?.name} is already occupied. Please select another unit.`,
        });
      } else {
        clearErrors("houseNumber");
      }
    } else {
      clearErrors("houseNumber");
    }
  }, [
    buildingId,
    houseTypeId,
    houseNumber,
    selectedBuildingWithUnits,
    selectedSettingsBuilding,
    setError,
    clearErrors,
  ]);

  const handleSubmit = async (values: TenantFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedBuilding = settingsBuildings.find(
        (b) => b.id === values.buildingId,
      );
      const selectedUnitType = selectedBuilding?.unitTypes?.find(
        (ut) => ut.id === values.houseTypeId,
      );

      if (!selectedBuilding || !selectedUnitType) {
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
        status: "active",
      };

      await onSubmitDialog(apiPayload);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available units based on selected type
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
  // clone FIRST, then sort
  availableUnits = availableUnits
    .slice()
    .sort((a, b) =>
      a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }),
    );

  if (buildingsLoading)
    return <LoadingDataState title="loading..." text="fetching buildings" />;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg">
          <icons.plus className="w-5 h-5 mr-2" />
          Add Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            {/* Name, Mobile, Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile *</FormLabel>
                    <FormControl>
                      <Input placeholder="+254712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
            </div>

            {/* Next of Kin Details */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nextOfKinName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next of Kin Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextOfKinMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next of Kin Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="+254711111111" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Building Selection */}
            <FormField
              control={form.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("houseTypeId", "");
                      setValue("houseNumber", "");
                      setValue("depositPaid", 0);
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
              control={form.control}
              name="houseTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Type/Size *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("houseNumber", "");
                      const deposit = calculateDeposit(value);
                      setValue("depositPaid", deposit);
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
              control={form.control}
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
                      {availableUnits.map((unit) => (
                        <SelectItem
                          key={unit.id}
                          value={unit.unit_number}
                          className={
                            unit.is_occupied ? "text-red-500" : "text-green-600"
                          }
                        >
                          {unit.unit_number}{" "}
                          <span className="text-xs">
                            {unit.is_occupied ? "(Occupied)" : "(Vacant)"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Area */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area/Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Westlands, Nairobi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deposit and Garbage Bill */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="depositPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Required *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Default:{" "}
                      {formatMoney(calculateDeposit(houseTypeId), currency)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="garbageBill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garbage Bill *</FormLabel>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: {formatMoney(150, currency)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Tenant...
                </>
              ) : (
                "Add Tenant"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
