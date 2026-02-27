// src/types/dashboard.types.ts

// export interface MonthlyPayment {
//   tenantId: string;
//   tenantName: string;
//   mobile: string;
//   houseNumber: string;
//   buildingName: string;
//   monthlyRent: number;
//   expectedGarbage: number;
//   expectedRent: number;
//   expectedWater: number;
//   expectedPenalties: number;
//   rentPaid: number;
//   waterPaid: number;
//   garbagePaid: number;
//   penaltiesPaid: number;
//   balanceDue: number;
//   advanceBalance: number;
//   month: string;
//   year: number;
//   paymentStatus?: string;
// }

export interface MonthlyPaymentsSummary {
  totalTenants: number;
  totalRentPaid: number;
  totalWaterPaid: number;
  totalGarbagePaid: number;
  totalPenaltiesPaid: number;
  totalBalanceDue: number;
  overdueTenants: number;
  paidTenants: number;
  partialTenants: number;
  notPaidTenants: number;
  totalExpected?: number;
  totalCollected?: number;
}

export interface MonthlyPaymentsFilters {
  month: string;
  year: number;
  buildingName?: string;
}

export interface MonthlyPaymentsResponse {
  success: boolean;
  message?: string;
  data: MonthlyPayment[];
  summary: MonthlyPaymentsSummary;
  filters: MonthlyPaymentsFilters;
}

export interface DashboardStats {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: any;
  color: "blue" | "green" | "red" | "yellow";
}

export interface MonthlyPayment {
  tenantId: string;
  tenantName: string;
  mobile: string;
  houseNumber: string;
  buildingName: string;
  monthlyRent: number;
  expectedGarbage: number;
  expectedRent: number;
  expectedWater: number;
  expectedPenalties: number;
  rentPaid: number;
  waterPaid: number;
  garbagePaid: number;
  penaltiesPaid: number;
  totalExpected: number;
  totalPaid: number;
  balance: number;
  outstanding: number;
  advance: number;
  paymentStatus: string;
  collectionRate: number;
}

export interface Summary {
  month: string;
  year: number;
  totalTenants: number;
  totalExpectedRent: number;
  totalExpectedWater: number;
  totalExpectedGarbage: number;
  totalExpectedPenalties: number;
  totalRentPaid: number;
  totalWaterPaid: number;
  totalGarbagePaid: number;
  totalPenaltiesPaid: number;
  totalBalanceDue: number;
  totalAdvanceBalance: number;
  paidTenants: number;
  partialTenants: number;
  notPaidTenants: number;
}

export interface MonthlyBreakdownProps {
  monthlyPaymentsData: MonthlyPayment[];
  summary: Summary;
  selectedMonth: string;
  selectedYear: number;
  currency: "KES" | "USD";
}
