// src/components/buildings/modals/StaffFormModal.tsx
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
import { useToast } from "@/hooks/use-toast";

export const StaffFormModal = ({ isOpen, onClose, onSave, staff = null }) => {
  const { toast } = useToast();

  const [form, setForm] = useState({
    role: "caretaker",
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staff) {
      setForm({
        role: staff.role || "caretaker",
        name: staff.name || "",
        phone: staff.phone || "",
        email: staff.email || "",
        address: staff.address || "",
      });
    } else if (isOpen) {
      setForm({
        role: "caretaker",
        name: "",
        phone: "",
        email: "",
        address: "",
      });
    }
    setErrors({});
  }, [staff, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s-()]+$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
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
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    });

    toast({
      title: staff ? "Staff Updated" : "Staff Added",
      description: staff
        ? `${form.name} has been updated successfully.`
        : `${form.name} has been added successfully.`,
    });

    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? "Edit Staff Member" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="staff-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: "" });
                }
              }}
              placeholder="Jane Mwangi"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="staff-role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm({ ...form, role: value })}
            >
              <SelectTrigger id="staff-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="caretaker">Caretaker</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="staff-phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-phone"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                if (errors.phone) {
                  setErrors({ ...errors, phone: "" });
                }
              }}
              placeholder="+2547xxxxxxxx"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email Address</Label>
            <Input
              id="staff-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              placeholder="jane@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Physical Address */}
          <div className="space-y-2">
            <Label htmlFor="staff-address">Physical Address</Label>
            <Input
              id="staff-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Westlands, Nairobi"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {staff ? "Update Staff" : "Save Staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
