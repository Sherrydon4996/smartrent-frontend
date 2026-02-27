import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/utils/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MonthlyBreakdownProps } from "./types";

export function MonthlyBreakdown({
  monthlyPaymentsData,
  summary,
  selectedMonth,
  selectedYear,
  currency,
}: MonthlyBreakdownProps) {
  // Calculate totals from summary
  const totalExpected =
    (summary?.totalExpectedRent || 0) +
    (summary?.totalExpectedWater || 0) +
    (summary?.totalExpectedGarbage || 0) +
    (summary?.totalExpectedPenalties || 0);

  const advance = summary.totalAdvanceBalance;

  const totalCollected =
    (summary?.totalRentPaid - advance || 0) +
    (summary?.totalWaterPaid || 0) +
    (summary?.totalGarbagePaid || 0) +
    (summary?.totalPenaltiesPaid || 0);

  const totalOutstanding = summary?.totalBalanceDue || 0;
  const collectionRate =
    totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const getStatusBadge = (status: string) => {
    if (status === "Paid") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Paid
        </span>
      );
    } else if (status === "Partial") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Partial
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not Paid
        </span>
      );
    }
  };

  const getBalanceIndicator = (balance: number) => {
    if (balance > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (balance < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">
              Monthly Payments Breakdown - {selectedMonth} {selectedYear}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed payment records from monthly_payments table
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {summary?.totalTenants || 0} Tenants
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                collectionRate >= 90
                  ? "bg-green-100 text-green-800"
                  : collectionRate >= 70
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {collectionRate}% Collected
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatMoney(totalExpected, currency)}
              </div>
              <div className="text-sm text-blue-600 mt-1 dark:text-blue-400 mt-1">
                Total Expected
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">
                {formatMoney(totalCollected, currency)}
              </div>
              <div className="text-sm text-green-600 mt-1">Total Collected</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-700">
                {formatMoney(totalOutstanding, currency)}
              </div>
              <div className="text-sm text-amber-600 mt-1">
                Total Outstanding
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 dark:from-purple-950/30 dark:to-purple-900/20 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-700">
                {collectionRate}%
              </div>
              <div className="text-sm text-purple-600 mt-1">
                Collection Rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Rent</span>
                <span
                  className={`text-sm font-semibold ${
                    (summary?.totalRentPaid || 0) >=
                    (summary?.totalExpectedRent || 0)
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {summary?.totalExpectedRent
                    ? Math.round(
                        ((summary.totalRentPaid - summary.totalAdvanceBalance ||
                          0) /
                          summary.totalExpectedRent) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">
                  {formatMoney(
                    summary?.totalRentPaid - summary.totalAdvanceBalance || 0,
                    currency,
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  of {formatMoney(summary?.totalExpectedRent || 0, currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Water</span>
                <span
                  className={`text-sm font-semibold ${
                    (summary?.totalWaterPaid || 0) >=
                    (summary?.totalExpectedWater || 0)
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {summary?.totalExpectedWater
                    ? Math.round(
                        ((summary.totalWaterPaid || 0) /
                          summary.totalExpectedWater) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">
                  {formatMoney(summary?.totalWaterPaid || 0, currency)}
                </span>
                <span className="text-xs text-gray-500">
                  of {formatMoney(summary?.totalExpectedWater || 0, currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Garbage
                </span>
                <span
                  className={`text-sm font-semibold ${
                    (summary?.totalGarbagePaid || 0) >=
                    (summary?.totalExpectedGarbage || 0)
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {summary?.totalExpectedGarbage
                    ? Math.round(
                        ((summary.totalGarbagePaid || 0) /
                          summary.totalExpectedGarbage) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">
                  {formatMoney(summary?.totalGarbagePaid || 0, currency)}
                </span>
                <span className="text-xs text-gray-500">
                  of {formatMoney(summary?.totalExpectedGarbage || 0, currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Penalties
                </span>
                <span
                  className={`text-sm font-semibold ${
                    (summary?.totalPenaltiesPaid || 0) >=
                    (summary?.totalExpectedPenalties || 0)
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {summary?.totalExpectedPenalties
                    ? Math.round(
                        ((summary.totalPenaltiesPaid || 0) /
                          summary.totalExpectedPenalties) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">
                  {formatMoney(summary?.totalPenaltiesPaid || 0, currency)}
                </span>
                <span className="text-xs text-gray-500">
                  of{" "}
                  {formatMoney(summary?.totalExpectedPenalties || 0, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Status Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {summary?.paidTenants || 0}
              </div>
              <div className="text-sm text-green-600 mt-1">Fully Paid</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {summary?.partialTenants || 0}
              </div>
              <div className="text-sm text-amber-600 mt-1">Partially Paid</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {summary?.notPaidTenants || 0}
              </div>
              <div className="text-sm text-red-600 mt-1">Not Paid</div>
            </div>
          </div>
        </div>

        {/* Detailed Tenant Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-border bg-muted/60">
                <th className="text-left py-4 px-4 font-semibold text-sm">
                  Tenant Details
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Rent
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Water
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Garbage
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Penalties
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Total Expected
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Total Paid
                </th>
                <th className="text-right py-4 px-4 font-semibold text-sm">
                  Balance
                </th>
                <th className="text-center py-4 px-4 font-semibold text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyPaymentsData.map((tenant) => (
                <tr
                  key={tenant.tenantId}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {tenant.tenantName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.houseNumber} • {tenant.buildingName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tenant.mobile}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatMoney(tenant.expectedRent, currency)}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          tenant.rentPaid >= tenant.expectedRent
                            ? "text-green-600"
                            : tenant.rentPaid > 0
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {formatMoney(tenant.rentPaid, currency)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatMoney(tenant.expectedWater, currency)}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        {formatMoney(tenant.waterPaid, currency)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatMoney(tenant.expectedGarbage, currency)}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        {formatMoney(tenant.garbagePaid, currency)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatMoney(tenant.expectedPenalties, currency)}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        {formatMoney(tenant.penaltiesPaid, currency)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-gray-900">
                      {formatMoney(tenant.totalExpected, currency)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-green-700">
                      {formatMoney(tenant.totalPaid, currency)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tenant.collectionRate}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {getBalanceIndicator(tenant.balance)}
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            tenant.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatMoney(Math.abs(tenant.balance), currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tenant.balance < 0 && "owed"}
                          {tenant.balance > 0 && "advance"}
                          {tenant.balance === 0 && "settled"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(tenant.paymentStatus)}
                  </td>
                </tr>
              ))}

              {/* Summary Row */}
              <tr className="bg-muted/40 border-t-2 border-border">
                <td className="py-4 px-4 font-bold text-gray-900">TOTALS</td>
                <td className="py-4 px-4 text-right">
                  <div className="text-sm text-gray-500">
                    {formatMoney(summary?.totalExpectedRent || 0, currency)}
                  </div>
                  <div className="text-xs font-bold text-green-600">
                    {formatMoney(summary?.totalRentPaid || 0, currency)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="text-sm text-gray-500">
                    {formatMoney(summary?.totalExpectedWater || 0, currency)}
                  </div>
                  <div className="text-xs font-bold text-green-600">
                    {formatMoney(summary?.totalWaterPaid || 0, currency)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="text-sm text-gray-500">
                    {formatMoney(summary?.totalExpectedGarbage || 0, currency)}
                  </div>
                  <div className="text-xs font-bold text-green-600">
                    {formatMoney(summary?.totalGarbagePaid || 0, currency)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="text-sm text-gray-500">
                    {formatMoney(
                      summary?.totalExpectedPenalties || 0,
                      currency,
                    )}
                  </div>
                  <div className="text-xs font-bold text-green-600">
                    {formatMoney(summary?.totalPenaltiesPaid || 0, currency)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">
                  {formatMoney(totalExpected, currency)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-green-700">
                  {formatMoney(totalCollected, currency)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-amber-700">
                  {formatMoney(totalOutstanding, currency)}
                </td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">
                  {collectionRate}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {monthlyPaymentsData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No payment records found</p>
            <p className="text-sm mt-2">
              No payment data available for {selectedMonth} {selectedYear}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MonthlyBreakdown;
