// src/types/tenantPayment.types.ts

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  waterBill: number;
  TotalAmount: number;
  rent: number;
  water: number;
  garbage: number;
  penalty: number;
  deposit: number;
  method: string;
  reference: string;
  date: string;
  timestamp: string;
  month: string;
  year: number;
  notes?: string;
}
export interface MonthlyHistoryItem {
  month: string;
  monthKey: string;
  year: number;
  expectedRent: number;
  rentPaid: number;
  waterPaid: number;
  garbagePaid: number;
  depositPaid: number;
  penaltyPaid: number;
  totalPaid: number;
  status: "paid" | "partial" | "unpaid" | "deposit";
  payments: PaymentTransaction[];
}

export interface TenantMonthlyRecord {
  tenantId: string;
  name?: string;
  houseNumber?: string;
  mobile?: number | string;
  buildingName?: string;
  month: string;
  year: number;
  monthlyRent: number;
  waterBill: number;
  garbageBill?: number;
  penalties: number;

  // Actual payments from transactions this month
  rentPaid: number;
  waterPaid: number;
  garbagePaid: number;
  depositPaid: number;
  penaltiesPaid: number;

  // Carried forward from previous month
  carriedForward: number;

  // Effective payments after applying carried forward
  effectiveRentPaid: number;
  effectiveWaterPaid: number;
  effectiveGarbagePaid: number;
  effectivePenaltiesPaid: number;

  balanceDue: number;
  advanceBalance: number;

  transactions: PaymentTransaction[];
  lastUpdated: string | null;
  status?: "active" | "inactive" | string;
}

export interface FetchMonthlyPaymentsParams {
  month: string;
  year: number;
}

export interface FetchTenantMonthlyRecordsParams {
  tenantId: string;
}

export interface UpsertTransactionParams {
  tenantId: string;
  transaction: Partial<PaymentTransaction>;
  record: Partial<TenantMonthlyRecord> & { month: string; year: number };
}

export interface MonthlyPaymentsResponse {
  success: boolean;
  message?: string;
  records: TenantMonthlyRecord[];
}

export interface UpsertTransactionResponse {
  success: boolean;
  message?: string;
  record: TenantMonthlyRecord;
  futureTransactions?: PaymentTransaction[];
}

export interface PaymentStatus {
  isPaidFull: boolean;
  isPartialPaid: boolean;
  isNotPaid: boolean;
  totalDue: number;
  totalAppliedThisMonth: number;
  advanceThisMonth: number;
  balanceDue: number;
}
