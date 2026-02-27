// src/types/tenant.types.ts

export interface Tenant {
  id: string;
  name: string;
  mobile: string;
  email: string;
  nextOfKinName?: string | null;
  nextOfKinMobile?: string | null;
  houseNumber: string;
  houseSize: string;
  area?: string | null;
  buildingName: string;
  monthlyRent: number;
  waterBill: number;
  garbageBill: number;
  penalties: number;
  depositPaid: number;
  expenses: number;
  tenantCredit: number;
  balanceDue: number;
  status: "active" | "left";
  leavingDate?: string | null;
  entryDate: string;
  created_at: string;
  updated_at?: string;
  advanceThisMonth: number;
  defaultWaterBill: number;
  depositRequired: number;
  totalBill: number;
  totalPaid: number;
}

export interface FetchTenantsParams {
  month: string;
  year: number;
}

export interface FetchTenantsResponse {
  success: boolean;
  count: number;
  records: Tenant[];
}

export interface TenantFormValues {
  name: string;
  mobile: string;
  nextOfKinName?: string;
  nextOfKinMobile?: string;
  houseNumber: string;
  buildingId: string;
  houseTypeId: string;
  area?: string;
  depositPaid?: number;
  expenses?: number;
}

export interface TenantApiPayload {
  name: string;
  mobile: string;
  nextOfKinName?: string;
  nextOfKinMobile?: string;
  houseNumber: string;
  houseSize: string;
  area?: string;
  buildingName: string;
  depositPaid?: number;
  status?: "active" | "left";
  monthlyRent?: number;
  expenses?: number;
}

export interface UpdateTenantPayload extends TenantApiPayload {
  monthlyRent: number;
  status: "active" | "left";
}

export interface CreateTenantResponse {
  success: boolean;
  message: string;
  data: Tenant;
}

export interface UpdateTenantResponse {
  success: boolean;
  message: string;
  data: Tenant;
}

export interface DeleteTenantResponse {
  success: boolean;
  message: string;
}

// Filter types
export type StatusFilter = "all" | "active" | "left";

export interface TenantFilters {
  buildingFilter: string;
  statusFilter: StatusFilter;
  searchTerm: string;
  selectedMonth: string;
  selectedYear: number;
}
