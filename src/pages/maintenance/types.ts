// src/types/maintenance.types.ts

export interface MaintenanceRequest {
  id: string;
  tenant_id: string | null;
  tenant_name: string | null;
  tenant_mobile: string | null;
  building_id: string;
  building_name: string;
  building_icon: string;
  unit_id: string;
  unit_number: string;
  issue_title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  cost: number;
  assigned_to: string | null;
  date: string;
  month: string;
  year: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface MaintenanceExpense {
  id: string;
  maintenance_request_id: string;
  description: string;
  amount: number;
  category?: string;
  paid_by: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  date: string;
  created_at: string;
  // Joined fields for display
  issue_title?: string;
  building_name?: string;
  building_id?: string;
  unit_number?: string;
}

export interface MaintenanceSummary {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  totalCost: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface MaintenanceFilters {
  buildingId?: string;
}

export interface FetchRequestsResponse {
  success: boolean;
  message?: string;
  data: MaintenanceRequest[];
  summary: MaintenanceSummary;
}

export interface FetchExpensesResponse {
  success: boolean;
  message?: string;
  data: MaintenanceExpense[];
}

export interface CreateRequestPayload {
  tenantId: string | null;
  buildingId: string;
  unitId: string;
  issueTitle: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  assignedTo?: string | null;
}

export interface UpdateStatusPayload {
  id: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface AddExpensePayload {
  id: string;
  data: {
    description: string;
    amount: number;
    paidBy: string | null;
    paymentMethod: string | null;
    receiptNumber: string | null;
  };
}

export interface CreateRequestResponse {
  success: boolean;
  message?: string;
  data: MaintenanceRequest;
}

export interface UpdateStatusResponse {
  success: boolean;
  message?: string;
  data: MaintenanceRequest;
}

export interface AddExpenseResponse {
  success: boolean;
  message?: string;
  data: {
    expense: MaintenanceExpense;
    totalCost: number;
  };
}
