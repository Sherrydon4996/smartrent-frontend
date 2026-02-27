// src/components/buildings/modals/UnitFormModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSettingsApi } from "@/hooks/useSettingsApi";

export const UnitFormModal = ({
  isOpen,
  onClose,
  onSave,
  unit = null,
  buildingId,
}) => {
  const { toast } = useToast();
  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();

  const currentBuilding = buildings.find((b) => b.id === buildingId);
  const availableUnitTypes = currentBuilding?.unitTypes || [];

  const [form, setForm] = useState({
    unit_type_id: "",
    unit_number: "",
    is_occupied: false,
    tenant_name: "",
    tenant_phone: "",
  });

  useEffect(() => {
    if (unit) {
      setForm({
        unit_type_id: unit.unit_type_id || "",
        unit_number: unit.unit_number || "",
        is_occupied: unit.is_occupied || false,
        tenant_name: unit.tenant_name || "",
        tenant_phone: unit.tenant_phone || "",
      });
    } else if (isOpen) {
      setForm({
        unit_type_id: availableUnitTypes[0]?.unit_type_id || "",
        unit_number: "",
        is_occupied: false,
        tenant_name: "",
        tenant_phone: "",
      });
    }
  }, [unit, isOpen, availableUnitTypes]);

  const handleSubmit = () => {
    // Validation
    if (!form.unit_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Unit number is required",
        variant: "destructive",
      });
      return;
    }

    if (!form.unit_type_id) {
      toast({
        title: "Validation Error",
        description: "Please select a unit type",
        variant: "destructive",
      });
      return;
    }

    if (form.is_occupied && !form.tenant_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Tenant name is required for occupied units",
        variant: "destructive",
      });
      return;
    }

    // Call the save handler (parent component)
    onSave(form);

    // Show success toast
    toast({
      title: unit ? "Unit Updated" : "Unit Added",
      description: unit
        ? `Unit ${form.unit_number} has been updated successfully.`
        : `New unit ${form.unit_number} has been added successfully.`,
    });

    // Close modal
    onClose();
  };

  if (availableUnitTypes.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center space-y-3">
            <p className="text-muted-foreground">
              No unit types configured for this building.
            </p>
            <p className="text-sm text-muted-foreground">
              Please configure unit types in Settings first.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Unit Type */}
          <div className="space-y-2">
            <Label htmlFor="unit-type">
              Unit Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.unit_type_id}
              onValueChange={(value) =>
                setForm({ ...form, unit_type_id: value })
              }
            >
              <SelectTrigger id="unit-type">
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                {availableUnitTypes.map((ut) => (
                  <SelectItem key={ut.unit_type_id} value={ut.unit_type_id}>
                    {ut.unit_type_name} - KES {ut.monthly_rent.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit Number */}
          <div className="space-y-2">
            <Label htmlFor="unit-number">
              Unit Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="unit-number"
              value={form.unit_number}
              onChange={(e) =>
                setForm({ ...form, unit_number: e.target.value })
              }
              placeholder="e.g. A-203, B12"
            />
          </div>

          {/* Currently Occupied Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="occupied"
              checked={form.is_occupied}
              onCheckedChange={(checked) =>
                setForm({ ...form, is_occupied: checked as boolean })
              }
            />
            <Label
              htmlFor="occupied"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Currently Occupied
            </Label>
          </div>

          {/* Conditional Tenant Fields */}
          {form.is_occupied && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">
                  Tenant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tenant-name"
                  value={form.tenant_name}
                  onChange={(e) =>
                    setForm({ ...form, tenant_name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant-phone">Tenant Phone</Label>
                <Input
                  id="tenant-phone"
                  value={form.tenant_phone}
                  onChange={(e) =>
                    setForm({ ...form, tenant_phone: e.target.value })
                  }
                  placeholder="+2547xxxxxxxx"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {unit ? "Update Unit" : "Save Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
