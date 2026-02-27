import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  User,
  Home,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Droplets,
  Trash2,
  Users,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrentDate } from "@/components/CurrentDate";
import { MonthlyBreakdownModal } from "@/components/MonthlyBreakdownModal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { GARBAGE_FEE } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { formatDate, MONTHS } from "@/utils/utils";
import { formatMoney } from "@/utils/utils";
import { LoadingDataState } from "@/loaders/dataLoader";
import { useTenantsList } from "@/hooks/useTenantsApi";
import { useTenantMonthlyRecords } from "@/hooks/useTenantPaymentApi";
import {
  MonthlyHistoryItem,
  PaymentTransaction,
  TenantMonthlyRecord,
} from "./monthlyUpdates/types";

export function TenantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currency = useAppSelector((state) => state.settingsQ.currency);

  const {
    selectedMonth,
    selectedYear,
    // loading: tenantsLoading,
  } = useAppSelector((state) => state.tenants);
  const {
    data: monthlyRecordsData,
    isLoading: paymentsLoading,
    isFetching: paymentsFetching,
    isError: paymentsError,
  } = useTenantMonthlyRecords(id);

  const [selectedMonthData, setSelectedMonthData] = useState<{
    monthName: string;
    monthKey: string;
    year: number;
    payments: PaymentTransaction[];
    expectedRent: number;
  } | null>(null);

  const { data, isLoading, isFetching, isError, error } = useTenantsList({
    month: selectedMonth,
    year: selectedYear,
  });
  const tenants = data?.records ?? [];
  console.log("tenant details", data);

  const tenant = tenants?.find((t) => t.id === id);
  const currentMonthRecord = monthlyRecordsData?.find(
    (r) =>
      r.tenantId === id && r.month === selectedMonth && r.year === selectedYear,
  );

  const tenantMonthlyRecords = monthlyRecordsData?.filter(
    (r) => r.tenantId === id,
  );

  if (!tenant) {
    if (isLoading || isFetching) {
      return (
        <div className="space-y-6 animate-fade-in">
          <CurrentDate />
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tenant details...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <CurrentDate />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tenant not found.</p>
          <Button onClick={() => navigate("/tenants")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tenants
          </Button>
        </div>
      </div>
    );
  }

  // Get all transactions
  const allTransactions: PaymentTransaction[] = tenantMonthlyRecords
    ?.flatMap((record) => record.transactions)
    ?.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  // Calculate lifetime totals
  const totalRentPaid = tenantMonthlyRecords?.reduce(
    (sum, r) => sum + (r.effectiveRentPaid || 0),
    0,
  );
  const totalWaterPaid = tenantMonthlyRecords?.reduce(
    (sum, r) => sum + (r.effectiveWaterPaid || 0),
    0,
  );
  const totalGarbagePaid = tenantMonthlyRecords?.reduce(
    (sum, r) => sum + (r.effectiveGarbagePaid || 0),
    0,
  );
  const totalPenalties = tenantMonthlyRecords?.reduce(
    (sum, r) => sum + (r.effectivePenaltiesPaid || 0),
    0,
  );
  const totalDeposits = tenantMonthlyRecords?.reduce(
    (sum, r) => sum + (r.depositPaid || 0),
    0,
  );
  const totalPaid =
    totalRentPaid +
    totalWaterPaid +
    totalGarbagePaid +
    totalPenalties +
    totalDeposits;

  // Calculate tenure
  const entryDate = new Date(tenant.entryDate);
  const today = new Date();
  const monthsInBuilding = Math.floor(
    (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  // Generate monthly history
  const generateMonthlyHistory = (): MonthlyHistoryItem[] => {
    const history: MonthlyHistoryItem[] = [];

    // Create a map of existing records from DB
    const recordsMap = new Map<string, TenantMonthlyRecord>();
    tenantMonthlyRecords?.forEach((record) => {
      const monthIndex = MONTHS.indexOf(record.month);
      const key = `${record.year}-${(monthIndex + 1)
        .toString()
        .padStart(2, "0")}`;
      recordsMap.set(key, record);
    });

    // Fill in all months from entry date to now
    const startDate = new Date(tenant.entryDate);
    const endDate = new Date();
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const monthIndex = currentDate.getMonth();
      const monthKey = `${year}-${(monthIndex + 1)
        .toString()
        .padStart(2, "0")}`;
      const monthName = currentDate.toLocaleDateString("en-KE", {
        month: "long",
        year: "numeric",
      });

      // Check if we have a record from DB
      const record = recordsMap.get(monthKey);

      if (record) {
        // Use data from DB
        const rentPaid = record.effectiveRentPaid || 0;
        const waterPaid = record.effectiveWaterPaid || 0;
        const garbagePaid = record.effectiveGarbagePaid || 0;
        const depositPaid = record.depositPaid || 0;
        const penaltyPaid = record.effectivePenaltiesPaid || 0;
        const totalPaid = rentPaid + waterPaid + garbagePaid + penaltyPaid;

        const isDepositMonth = depositPaid > 0;
        const rentStatus = isDepositMonth
          ? "deposit"
          : rentPaid >= record.monthlyRent
            ? "paid"
            : rentPaid > 0
              ? "partial"
              : "unpaid";

        history.push({
          month: monthName,
          monthKey,
          year,
          expectedRent: record.monthlyRent,
          rentPaid,
          waterPaid,
          garbagePaid,
          depositPaid,
          penaltyPaid,
          totalPaid,
          status: rentStatus,
          payments: record.transactions || [],
        });
      } else {
        // No record in DB - show as unpaid
        history.push({
          month: monthName,
          monthKey,
          year,
          expectedRent: tenant.monthlyRent || 0,
          rentPaid: 0,
          waterPaid: 0,
          garbagePaid: 0,
          depositPaid: 0,
          penaltyPaid: 0,
          totalPaid: 0,
          status: "unpaid",
          payments: [],
        });
      }

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return history.reverse();
  };

  const monthlyHistory = generateMonthlyHistory();

  // Calculate current month charges
  const totalMonthlyCharges =
    (tenant.monthlyRent || 0) +
    (currentMonthRecord?.waterBill || tenant.waterBill || 0) +
    GARBAGE_FEE;

  // Calculate current balance properly - trust the backend calculation
  const currentBalance = (() => {
    if (!currentMonthRecord) {
      return totalMonthlyCharges; // No payment record, full amount due
    }

    const balanceDue = currentMonthRecord.balanceDue || 0;

    // If balance is 0, tenant is fully paid
    if (balanceDue === 0) {
      return 0;
    }

    return balanceDue;
  })();

  // Get advance balance for display
  const advanceBalance = currentMonthRecord?.advanceBalance || 0;

  if (paymentsLoading) {
    return <LoadingDataState CurrentDate={CurrentDate} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentDate />

      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/tenants")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{tenant.name}</h1>
          <p className="text-muted-foreground">
            Complete Tenant Profile & Payment History
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entry Date</p>
                <p className="font-semibold text-foreground">
                  {formatDate(tenant.entryDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {monthsInBuilding} months in building
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Home className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">House</p>
                <p className="font-semibold text-foreground">
                  {tenant.houseNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tenant.houseSize} • {tenant.area}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <CreditCard className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly</p>
                <p className="font-semibold text-foreground">
                  {formatMoney(totalMonthlyCharges, currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Rent + Water + Garbage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  currentBalance === 0 ? "bg-success/10" : "bg-danger/10",
                )}
              >
                {currentBalance === 0 ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-danger" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p
                  className={cn(
                    "font-semibold text-lg",
                    currentBalance === 0 ? "text-success" : "text-danger",
                  )}
                >
                  {currentBalance === 0
                    ? "Fully Paid ✓"
                    : formatMoney(currentBalance, currency)}
                </p>

                {/* Show advance if exists */}
                {advanceBalance > 0 && currentBalance === 0 && (
                  <div className="mt-1">
                    <span className="px-2 py-0.5 bg-success/20 rounded text-xs font-medium text-success">
                      Advance: {formatMoney(advanceBalance, currency)}
                    </span>
                  </div>
                )}

                {/* Show payment breakdown */}
                {currentMonthRecord && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Paid:{" "}
                    {formatMoney(
                      (currentMonthRecord.effectiveRentPaid || 0) +
                        (currentMonthRecord.effectiveWaterPaid || 0) +
                        (currentMonthRecord.effectiveGarbagePaid || 0),
                      currency,
                    )}{" "}
                    of {formatMoney(totalMonthlyCharges, currency)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">{tenant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">{tenant.mobile}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">
                    {tenant?.email || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    tenant.status === "active"
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tenant.status === "active" ? "Active" : "Left"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Area/Location</p>
                <p className="font-medium text-foreground">
                  {tenant.area || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entry Date</p>
                <p className="font-medium text-foreground">
                  {formatDate(tenant.entryDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leaving Date</p>
                <p
                  className={cn(
                    "font-medium",
                    tenant.leavingDate
                      ? "text-muted-foreground"
                      : "text-success",
                  )}
                >
                  {tenant.leavingDate
                    ? formatDate(tenant.leavingDate)
                    : "Still Active"}
                </p>
              </div>
            </div>

            {/* Deposit Information */}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Deposit Information
              </p>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Deposit Paid</p>
                <p className="text-xl font-bold text-primary">
                  {formatMoney(tenant.depositPaid || 0, currency)}
                </p>
              </div>
            </div>

            {/* Tenant Expenses */}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tenant Expenses (e.g., Repairs)
              </p>
              <div className="p-3 bg-danger/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-danger">
                  {formatMoney(tenant?.expenses, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  To be deducted from deposit upon leaving
                </p>
              </div>
            </div>

            {/* Next of Kin */}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Next of Kin Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">
                    {tenant.nextOfKinName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      {tenant.nextOfKinMobile || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Charges Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Charges Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">
                    Monthly Rent
                  </span>
                </div>
                <span className="font-bold text-foreground">
                  {formatMoney(tenant.monthlyRent, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium text-foreground">
                      Water Bill
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Variable)
                    </span>
                  </div>
                </div>
                <span className="font-bold text-foreground">
                  {formatMoney(
                    currentMonthRecord?.waterBill || tenant.waterBill || 0,
                    currency,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium text-foreground">
                      Garbage Fee
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Fixed)
                    </span>
                  </div>
                </div>
                <span className="font-bold text-foreground">
                  {formatMoney(GARBAGE_FEE, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <span className="font-bold text-foreground">Total Monthly</span>
                <span className="text-xl font-bold text-primary">
                  {formatMoney(totalMonthlyCharges, currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary (Lifetime)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-sm md:text-base font-bold text-success">
                {formatMoney(totalPaid, currency)}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Rent Paid</p>
              <p className="text-sm md:text-base font-bold text-foreground">
                {formatMoney(totalRentPaid, currency)}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Water Paid</p>
              <p className="text-sm md:text-base font-bold text-foreground">
                {formatMoney(totalWaterPaid, currency)}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Garbage Paid</p>
              <p className="text-sm md:text-base font-bold text-foreground">
                {formatMoney(totalGarbagePaid, currency)}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Deposit Paid</p>
              <p className="text-sm md:text-base font-bold text-primary">
                {formatMoney(totalDeposits, currency)}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Penalties Paid</p>
              <p className="text-sm md:text-base font-bold text-danger">
                {formatMoney(totalPenalties, currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payment History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            Monthly Payment History (Since Entry)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Month
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Rent
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Water
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Garbage
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Deposit
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Penalty
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyHistory.map((record, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                      record.status === "paid" || record.status === "deposit"
                        ? "status-paid"
                        : record.status === "unpaid"
                          ? "status-overdue"
                          : "",
                    )}
                    onClick={() =>
                      setSelectedMonthData({
                        monthName: record.month,
                        monthKey: record.monthKey,
                        year: record.year,
                        payments: record.payments,
                        expectedRent: record.expectedRent,
                      })
                    }
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {record.month}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {formatMoney(record.rentPaid, currency)}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {formatMoney(record.waterPaid, currency)}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {formatMoney(record.garbagePaid, currency)}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {record.depositPaid > 0
                        ? formatMoney(record.depositPaid, currency)
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {formatMoney(record.penaltyPaid, currency)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {formatMoney(record.totalPaid, currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          record.status === "paid"
                            ? "bg-success/20 text-success"
                            : record.status === "deposit"
                              ? "bg-primary/20 text-primary"
                              : record.status === "partial"
                                ? "bg-warning/20 text-warning"
                                : "bg-danger/20 text-danger",
                        )}
                      >
                        {record.status === "paid"
                          ? "Paid"
                          : record.status === "deposit"
                            ? "Deposit"
                            : record.status === "partial"
                              ? "Partial"
                              : "Unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Transactions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {allTransactions?.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No transactions recorded yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Rent
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Water
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Garbage
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Penalty
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Deposit
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Method
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Reference
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Month
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions?.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border hover:bg-muted/30"
                    >
                      <td className="py-3 px-4 text-foreground">
                        {formatDate(tx?.date)}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {formatMoney(tx?.rent, currency)}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {formatMoney(tx?.water, currency)}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {formatMoney(tx?.garbage, currency)}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {formatMoney(tx?.penalty, currency)}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {formatMoney(tx?.deposit, currency)}
                      </td>
                      <td className="py-3 px-4 text-foreground capitalize">
                        {tx.method}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-sm">
                        {tx.reference}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {tx.month} {tx.year}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Breakdown Modal */}
      {selectedMonthData && tenant && (
        <MonthlyBreakdownModal
          isOpen={!!selectedMonthData}
          onClose={() => setSelectedMonthData(null)}
          monthName={selectedMonthData.monthName}
          monthKey={selectedMonthData.monthKey}
          payments={selectedMonthData.payments}
          expectedRent={selectedMonthData.expectedRent}
          tenantName={tenant.name}
        />
      )}
    </div>
  );
}
