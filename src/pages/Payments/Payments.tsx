import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Calendar, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrentDate } from "@/components/CurrentDate";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PaymentStatsCards } from "./PaymentStatsCards";
import { setSelectedMonth, setSelectedYear } from "@/slices/TenantsSlice";
import { MONTHS, generateYears, formatMoney, formatDate } from "@/utils/utils";
import { exportToPDF, GroupedPayment, Transaction } from "./paymentsPDF";
import { useTenantsList } from "@/hooks/useTenantsApi";
import { useAllMonthlyRecords } from "@/hooks/useTenantPaymentApi";
import { LoadingState } from "@/loaders/dataLoader";

export function Payments() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { selectedMonth, selectedYear } = useAppSelector(
    (state) => state.tenants,
  );

  const {
    data: fullMonthlyRecords,
    isLoading,
    isFetching,
    isError,
    error,
  } = useAllMonthlyRecords({
    month: selectedMonth,
    year: selectedYear,
  });

  const currency = useAppSelector((state) => state.settingsQ.currency);

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newPayment, setNewPayment] = useState({
    tenantId: "",
    amount: "",
    method: "mpesa",
    reference: "",
    type: "rent",
  });

  // const { data, isLoading, isFetching, isError, error } = useTenantsList({
  //   month: selectedMonth,
  //   year: selectedYear,
  // });
  // const tenants = data?.records || [];

  // ────────────────────────────────────────────────
  //  Aggregated Totals (excluding deposit from main total)
  // ────────────────────────────────────────────────
  const allTransactions: Transaction[] = useMemo(() => {
    if (!fullMonthlyRecords?.length) return [];

    return fullMonthlyRecords
      .flatMap((record) => record.transactions || [])
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [fullMonthlyRecords]);

  const rentTotal = allTransactions?.reduce((sum, tx) => sum + tx.rent, 0);
  const waterTotal = allTransactions?.reduce((sum, tx) => sum + tx.water, 0);
  const garbageTotal = allTransactions?.reduce(
    (sum, tx) => sum + tx.garbage,
    0,
  );
  const depositTotal = allTransactions?.reduce(
    (sum, tx) => sum + tx.deposit,
    0,
  );
  const penaltyTotal = allTransactions?.reduce(
    (sum, tx) => sum + tx.penalty,
    0,
  );

  // Main collected amount = rent + water + garbage + penalty (excluding deposit)
  const recurringCollected =
    rentTotal + waterTotal + garbageTotal + penaltyTotal;

  const mpesaTotal = allTransactions
    ?.filter((tx) => tx.method === "mpesa")
    ?.reduce((sum, tx) => sum + tx.TotalAmount, 0);

  const bankTotal = allTransactions
    ?.filter((tx) =>
      ["equity", "kcb", "cooperative", "family_bank"].includes(tx.method),
    )
    ?.reduce((sum, tx) => sum + tx.TotalAmount, 0);

  const cashTotal = allTransactions
    ?.filter((tx) => tx.method === "cash")
    ?.reduce((sum, tx) => sum + tx.TotalAmount, 0);

  // ────────────────────────────────────────────────
  //  Grouped tenant payment summary
  // ────────────────────────────────────────────────
  const groupedPayments: GroupedPayment[] = useMemo(() => {
    if (!fullMonthlyRecords?.length) return [];

    return fullMonthlyRecords
      ?.map((record) => {
        const rentPaid =
          record.transactions?.reduce((sum, tx) => sum + tx.rent, 0) ?? 0;
        const waterPaid =
          record.transactions?.reduce((sum, tx) => sum + tx.water, 0) ?? 0;
        const garbagePaid =
          record.transactions?.reduce((sum, tx) => sum + tx.garbage, 0) ?? 0;
        const depositPaid =
          record.transactions?.reduce((sum, tx) => sum + tx.deposit, 0) ?? 0;
        const penaltyPaid =
          record.transactions?.reduce((sum, tx) => sum + tx.penalty, 0) ?? 0;

        const totalPaid =
          rentPaid + waterPaid + garbagePaid + depositPaid + penaltyPaid;

        return {
          tenantId: record.tenantId,
          name: record.name || "",
          houseNumber: record.houseNumber || "",
          buildingName: record.buildingName || "",
          mobile: record.mobile || "",
          totalPaid,
          rentPaid,
          waterPaid,
          garbagePaid,
          depositPaid,
          penaltyPaid,
          transactions: record.transactions || [],
          lastUpdated: record.lastUpdated,
        };
      })
      .filter((p) => p.totalPaid > 0);
  }, [fullMonthlyRecords]);

  // ────────────────────────────────────────────────
  //  Filtering
  // ────────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    return groupedPayments.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        payment.name.toLowerCase().includes(searchLower) ||
        payment.houseNumber.toLowerCase().includes(searchLower) ||
        payment.buildingName.toLowerCase().includes(searchLower) ||
        payment.transactions
          ?.map((tx) => tx.reference)
          ?.filter(Boolean)
          ?.join(", ")
          ?.toLowerCase()
          ?.includes(searchLower);

      const matchesMethod =
        methodFilter === "all" ||
        payment.transactions.some((tx) => tx.method === methodFilter);

      return matchesSearch && matchesMethod;
    });
  }, [groupedPayments, searchTerm, methodFilter]);

  // ────────────────────────────────────────────────
  //  Handlers
  // ────────────────────────────────────────────────
  const handleAddPayment = () => {
    if (!newPayment.tenantId || !newPayment.amount || !newPayment.reference) {
      toast({
        title: "Missing fields",
        description: "Tenant, amount and reference are required.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payment recorded",
      description: `${formatMoney(parseFloat(newPayment.amount), currency)} recorded.`,
    });

    setIsAddDialogOpen(false);
    // TODO: actually dispatch action to save payment
  };

  const handleExportPDF = () => {
    if (!filteredPayments.length) {
      toast({
        title: "Nothing to export",
        description: "No payments found for selected period.",
      });
      return;
    }

    toast({
      title: "Exporting...",
      description: "Generating PDF report",
    });

    exportToPDF(
      filteredPayments,
      selectedMonth,
      selectedYear,
      currency,
      formatMoney,
      formatDate,
      (txs) => {
        // Reuse your existing method label logic
        const methods = txs.reduce((acc: Record<string, number>, tx) => {
          acc[tx.method] = (acc[tx.method] || 0) + 1;
          return acc;
        }, {});
        const top =
          Object.entries(methods).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          "mpesa";
        const labels: Record<string, string> = {
          mpesa: "M-Pesa",
          cash: "Cash",
          equity: "Equity Bank",
          kcb: "KCB",
          cooperative: "Co-operative Bank",
          family_bank: "Family Bank",
        };
        return labels[top] || top;
      },
    );
  };

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────

  if (isLoading || isFetching)
    return (
      <LoadingState
        title="Loading data"
        text="Please wait while we fetch your data..."
      />
    );
  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <CurrentDate />

      {/* Header + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Track and record all rental & utility payments
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Record Payment
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* <div className="grid gap-2">
                <Label>Tenant *</Label>
                <Select
                  value={newPayment.tenantId}
                  onValueChange={(v) =>
                    setNewPayment((p) => ({ ...p, tenantId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants
                      ?.filter((t) => t.status === "active")
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {t.houseNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* <div className="grid gap-2">
                <Label>Payment Type *</Label>
                <Select
                  value={newPayment.type}
                  onValueChange={(v) =>
                    setNewPayment((p) => ({ ...p, type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="water">Water Bill</SelectItem>
                    <SelectItem value="garbage">
                     Garbage Fee ({formatMoney(GARBAGE_FEE, currency)}) 
                    </SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div className="grid gap-2">
                <Label>Amount ({currency}) *</Label>
                <Input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder={newPayment.type === "garbage" ? "150" : "8500"}
                />
              </div>

              <div className="grid gap-2">
                <Label>Payment Method *</Label>
                <Select
                  value={newPayment.method}
                  onValueChange={(v) =>
                    setNewPayment((p) => ({ ...p, method: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="equity">Equity Bank</SelectItem>
                    <SelectItem value="kcb">KCB</SelectItem>
                    <SelectItem value="cooperative">
                      Co-operative Bank
                    </SelectItem>
                    <SelectItem value="family_bank">Family Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Transaction Reference *</Label>
                <Input
                  value={newPayment.reference}
                  onChange={(e) =>
                    setNewPayment((p) => ({ ...p, reference: e.target.value }))
                  }
                  placeholder="QWE123456 / MPESA CONFIRM CODE"
                />
              </div>

              <Button onClick={handleAddPayment} className="mt-2 w-full">
                Save Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month / Year Selector */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Records for {selectedMonth} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px]">
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Month
              </Label>
              <Select
                value={selectedMonth}
                onValueChange={(v) => dispatch(setSelectedMonth(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[110px]">
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Year
              </Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => dispatch(setSelectedYear(Number(v)))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateYears().map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Stats Cards ─── */}
      <PaymentStatsCards
        totalCollected={recurringCollected}
        rentTotal={rentTotal}
        waterTotal={waterTotal}
        garbageTotal={garbageTotal}
        depositTotal={depositTotal}
        mpesaTotal={mpesaTotal}
        bankTotal={bankTotal}
        cashTotal={cashTotal}
        formatCurrency={(amt) => formatMoney(amt, currency)}
      />

      {/* Filters + Export */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search tenant, house, building, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="kcb">KCB</SelectItem>
            <SelectItem value="cooperative">Co-op Bank</SelectItem>
            <SelectItem value="family_bank">Family Bank</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="h-11" onClick={handleExportPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Payment Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>
            Payment Summary – {selectedMonth} {selectedYear}
          </CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-muted/60 border-b">
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Tenant
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  House
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Building
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Rent
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Water
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Garbage
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Deposit
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Penalty
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Total
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-muted-foreground">
                  Last Updated
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((p) => (
                <tr
                  key={p.tenantId}
                  className="border-b hover:bg-muted/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.mobile}
                    </div>
                  </td>
                  <td className="py-4 px-4">{p.houseNumber}</td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {p.buildingName}
                  </td>

                  <td className="py-3 px-4">
                    {p.rentPaid > 0 ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-primary">
                          {formatMoney(p.rentPaid, currency)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Rent
                        </div>
                        {!!p.transactions?.length && (
                          <div className="text-[10px] text-muted-foreground/80 leading-tight">
                            {p.transactions
                              .map((t) => t.reference)
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {p.waterPaid > 0 ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                          {formatMoney(p.waterPaid, currency)}
                        </div>
                        {!!p.transactions?.length && (
                          <div className="text-[10px] text-muted-foreground/80">
                            {p.transactions
                              .map((t) => t.reference)
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {p.garbagePaid > 0 ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-orange-600 dark:text-orange-400">
                          {formatMoney(p.garbagePaid, currency)}
                        </div>
                        {!!p.transactions?.length && (
                          <div className="text-[10px] text-muted-foreground/80">
                            {p.transactions
                              .map((t) => t.reference)
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {p.depositPaid > 0 ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-green-600 dark:text-green-400">
                          {formatMoney(p.depositPaid, currency)}
                        </div>
                        {!!p.transactions?.length && (
                          <div className="text-[10px] text-muted-foreground/80">
                            {p.transactions
                              .map((t) => t.reference)
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {p.penaltyPaid > 0 ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-red-600 dark:text-red-400">
                          {formatMoney(p.penaltyPaid, currency)}
                        </div>
                        {!!p.transactions?.length && (
                          <div className="text-[10px] text-muted-foreground/80">
                            {p.transactions
                              .map((t) => t.reference)
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {formatMoney(p.totalPaid, currency)}
                  </td>

                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {formatDate(p.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>

            {filteredPayments.length > 0 && (
              <tfoot className="bg-muted/60 border-t">
                <tr>
                  <td colSpan={3} className="py-4 px-4 font-bold">
                    TOTALS
                  </td>
                  <td className="py-4 text-sm px-4 font-bold text-primary">
                    {formatMoney(
                      filteredPayments.reduce((s, p) => s + p.rentPaid, 0),
                      currency,
                    )}
                  </td>
                  <td className="py-4 text-sm px-4 font-bold text-blue-600">
                    {formatMoney(
                      filteredPayments.reduce((s, p) => s + p.waterPaid, 0),
                      currency,
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-orange-600">
                    {formatMoney(
                      filteredPayments.reduce((s, p) => s + p.garbagePaid, 0),
                      currency,
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-green-600">
                    {formatMoney(
                      filteredPayments.reduce((s, p) => s + p.depositPaid, 0),
                      currency,
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-red-600">
                    {formatMoney(
                      filteredPayments.reduce((s, p) => s + p.penaltyPaid, 0),
                      currency,
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-emerald-600">
                    {formatMoney(
                      filteredPayments.reduce((s, p) => s + p.totalPaid, 0),
                      currency,
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-sm text-muted-foreground">
                    {filteredPayments.length} tenant
                    {filteredPayments.length !== 1 ? "s" : ""}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {filteredPayments.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            No payments recorded for {selectedMonth} {selectedYear}
          </div>
        )}
      </Card>
    </div>
  );
}
