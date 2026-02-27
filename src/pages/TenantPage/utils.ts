import * as z from "zod";
import { api } from "@/Apis/axiosApi";
import { Tenant } from "./types";

export function calculateTenantStatus(tenant: Tenant) {
  const totalBill =
    tenant.monthlyRent +
    tenant.waterBill +
    tenant.garbageBill +
    tenant.penalties;

  const prevAdvance = tenant.prevMonthAdvance || 0;
  const currentBalance = tenant.balanceDue || 0;
  const currentAdvance = tenant.advanceBalance || 0;

  const displayBalance = currentAdvance > 0 ? 0 : currentBalance;

  return {
    totalBill,
    prevAdvance,
    appliedAdvance: tenant.appliedAdvance || 0,
    currentBalance,
    displayBalance,
    nextMonthAdvance: currentAdvance,
    isPaid: displayBalance === 0,
  };
}

export function getPaymentStatus(
  tenant: Tenant,
): "paid" | "pending" | "overdue" {
  const today = new Date();
  const day = today.getDate();
  const status = calculateTenantStatus(tenant);

  if (status.isPaid) return "paid";
  if (day < 5) return "pending";
  if (status.displayBalance > 0) return "overdue";
  return "pending";
}

export const tenantFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  mobile: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Please enter a valid phone number (10-15 digits)",
    )
    .min(10, "Mobile number must be at least 10 digits"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  nextOfKinName: z.string().optional(),
  nextOfKinMobile: z
    .string()
    .regex(/^(\+?[0-9]{10,15})?$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  houseNumber: z
    .string()
    .min(1, "House number is required")
    .max(20, "House number is too long"),
  buildingId: z.string().min(1, "Please select a building"),
  houseTypeId: z.string().min(1, "Please select a house type"),
  area: z.string().optional(),
  depositPaid: z.number().optional(),
  garbageBill: z.number(),
  expenses: z
    .number()
    .min(0, "Expenses cannot be negative")
    .optional()
    .or(z.literal(undefined)),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

// API payload type (what the backend expects)
export interface TenantApiPayload {
  name: string;
  mobile: string;
  email?: string; // ← added
  nextOfKinName?: string;
  nextOfKinMobile?: string;
  houseNumber: string;
  houseSize: string;
  area?: string;
  buildingName: string;
  depositPaid?: number;
  status?: "active" | "left";
  monthlyRent?: number;
  garbageBill: number;
  expenses?: number;
}

export const createTenant = async (data: TenantApiPayload) => {
  const response = await api.post("/api/v1/tenants/addNewTenant", data);
  return response.data;
};

export const updateTenant = async (
  tenantId: string,
  payload: TenantApiPayload & {
    monthlyRent: number;
    status: "active" | "left";
  },
) => {
  return await api.put(`/api/v1/tenants/updateTenant/${tenantId}`, payload);
};

export const deleteTenant = async (tenantId: string) => {
  return await api.delete(`/api/v1/tenants/deleteTenant/${tenantId}`);
};
// Add this to your API functions file (where createTenant, updateTenant are defined)
export const recalculatePenalties = async () => {
  const response = await api.post("/api/v1/admin/penalties/calculate");
  return response.data;
};
