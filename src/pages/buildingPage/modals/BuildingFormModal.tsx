// src/components/buildings/modals/BuildingFormModal.tsx
import { useState, useEffect } from "react";
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
import { BUILDING_ICONS } from "../utils";
import type { Building } from "../utils";

interface BuildingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  building?: Building | null;
}

export const BuildingFormModal: React.FC<BuildingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  building = null,
}) => {
  const [form, setForm] = useState({
    name: "",
    type: "residential",
    city: "",
    wifi_installed: false,
    icon: "b1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (building) {
      setForm({
        name: building.name || "",
        type: building.type || "residential",
        city: building.city || "",
        wifi_installed: building.wifi_installed || false,
        icon: building.icon || "b1",
      });
    } else if (isOpen) {
      setForm({
        name: "",
        type: "residential",
        city: "",
        wifi_installed: false,
        icon: "b1",
      });
    }
    setErrors({});
  }, [building, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Building name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Building name must be at least 2 characters";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    } else if (form.city.trim().length < 2) {
      newErrors.city = "City must be at least 2 characters";
    }

    if (!form.icon) {
      newErrors.icon = "Please select an icon";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      city: form.city.trim(),
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {building ? "Edit Building" : "Add New Building"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Building Name */}
          <div className="space-y-2">
            <Label htmlFor="building-name">
              Building Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="building-name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: "" });
                }
              }}
              placeholder="e.g. Riverside Apartments"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Building Type */}
          <div className="space-y-2">
            <Label htmlFor="building-type">
              Building Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value })}
            >
              <SelectTrigger id="building-type">
                <SelectValue placeholder="Select building type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => {
                setForm({ ...form, city: e.target.value });
                if (errors.city) {
                  setErrors({ ...errors, city: "" });
                }
              }}
              placeholder="e.g. Nairobi"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          {/* Building Icon */}
          <div className="space-y-2">
            <Label>
              Building Icon <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(BUILDING_ICONS || {}).map(([key, emoji]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, icon: key });
                    if (errors.icon) {
                      setErrors({ ...errors, icon: "" });
                    }
                  }}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all hover:border-primary text-3xl ${
                    form.icon === key
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {errors.icon && (
              <p className="text-sm text-destructive">{errors.icon}</p>
            )}
          </div>

          {/* WiFi Installed */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wifi"
              checked={form.wifi_installed}
              onCheckedChange={(checked) =>
                setForm({ ...form, wifi_installed: checked as boolean })
              }
            />
            <Label
              htmlFor="wifi"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              WiFi Installed
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {building ? "Update Building" : "Save Building"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
