// types/reportTypes.ts

export interface ReportFilters {
  buildingName?: string;
  month?: string;
  year?: number;
  status?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  minBalance?: number;
  limit?: number;
}

export interface TenantBalance {
  tenantId: string;
  name: string;
  mobile: string;
  houseNumber: string;
  buildingName: string;
  monthlyRent: number;
  expectedWater: number;
  expectedGarbage: number;
  status: string;
  rentPaid: number;
  waterPaid: number;
  garbagePaid: number;
  penaltiesPaid: number;
  penalties: number;
  balanceDue: number;
  advanceBalance: number;
  totalDue: number;
  totalPaid: number;
  outstandingBalance: number;
  month?: string;
  year?: number;
  lastUpdated?: string;
}

export interface PaymentHistory {
  id: string;
  tenantName: string;
  mobile: string;
  houseNumber: string;
  buildingName: string;
  transactionId: string;
  totalAmount: number;
  rent: number;
  water: number;
  garbage: number;
  penalty: number;
  deposit: number;
  method: string;
  reference: string;
  date: string;
  month: string;
  year: number;
  notes?: string;
  timestamp: string;
}

export interface ReportState {
  tenantBalances: {
    data: TenantBalance[];
    summary: any;
    filters: ReportFilters;
    loading: boolean;
    error: string | null;
  };
  paymentHistory: {
    data: PaymentHistory[];
    summary: any;
    filters: ReportFilters;
    loading: boolean;
    error: string | null;
  };
  monthlyIncome: {
    data: any[];
    summary: any;
    filters: ReportFilters;
    loading: boolean;
    error: string | null;
  };
  outstandingBalances: {
    data: any[];
    summary: any;
    filters: ReportFilters;
    loading: boolean;
    error: string | null;
  };
  annualSummary: {
    data: any;
    filters: ReportFilters;
    loading: boolean;
    error: string | null;
  };
}
