import React, { useState, useMemo } from "react";
import {
  Plus,
  DollarSign,
  TrendingDown,
  Building2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrentDate } from "@/components/CurrentDate";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ErrorState } from "@/errors/dataError";
import { getIconEmoji } from "./buildingPage/utils";
import { formatDate, formatMoney } from "@/utils/utils";
import { useToast } from "@/hooks/use-toast";

// React Query hooks
import { useBuildingsList } from "@/hooks/useBuildingAps";
import {
  useMaintenanceRequests,
  useMaintenanceExpenses,
  useAddMaintenanceExpense,
} from "@/hooks/useMaintenanceApi";
import { useAppSelector } from "@/store/hooks";

const EXPENSE_CATEGORIES = [
  "Repairs",
  "Utilities",
  "Maintenance",
  "Insurance",
  "Security",
  "Cleaning",
  "Legal",
  "Marketing",
  "Other",
];

export function Expenses() {
  // ── Local State ──────────────────────────────────────────────────────────
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState<string>("all");

  const [newExpense, setNewExpense] = useState({
    maintenanceRequestId: "",
    category: "",
    amount: "",
    paidBy: "",
    paymentMethod: "",
    receiptNumber: "",
  });

  // ── Redux & React Query ──────────────────────────────────────────────────
  const currency = useAppSelector((state) => state.settingsQ.currency);
  const { toast } = useToast();

  const {
    data: buildings = [],
    isLoading: buildingsLoading,
    isError: buildingsError,
    error: buildingsErrorObj,
  } = useBuildingsList();

  const { data: requestsResponse, isLoading: requestsLoading } =
    useMaintenanceRequests(
      buildingFilter !== "all" ? { buildingId: buildingFilter } : undefined,
    );

  const {
    data: expensesResponse,
    isLoading: expensesLoading,
    isError: expensesError,
    error: expensesErrorObj,
    refetch: refetchExpenses,
  } = useMaintenanceExpenses(
    buildingFilter !== "all" ? { buildingId: buildingFilter } : undefined,
  );

  const addExpenseMutation = useAddMaintenanceExpense();

  // ── Computed ─────────────────────────────────────────────────────────────
  const requests = requestsResponse?.data || [];
  const expenses = expensesResponse?.data || [];
  const isLoading = buildingsLoading || requestsLoading || expensesLoading;

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses],
  );

  const expensesByCategory = useMemo(() => {
    return expenses.reduce(
      (acc, exp) => {
        const cat = exp.category || "Other";
        acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [expenses]);

  const selectedRequest = useMemo(() => {
    return requests.find((r) => r.id === newExpense.maintenanceRequestId);
  }, [requests, newExpense.maintenanceRequestId]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddExpense = async () => {
    if (
      !newExpense.maintenanceRequestId ||
      !newExpense.category ||
      !newExpense.amount
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (marked with *)",
        variant: "destructive",
      });
      return;
    }

    try {
      await addExpenseMutation.mutateAsync({
        id: newExpense.maintenanceRequestId,
        data: {
          description: selectedRequest?.description || "",
          amount: parseFloat(newExpense.amount),
          paidBy: newExpense.paidBy || null,
          paymentMethod: newExpense.paymentMethod || null,
          receiptNumber: newExpense.receiptNumber || null,
          category: newExpense.category,
        },
      });

      toast({
        title: "Expense added successfully",
        variant: "success",
        description: `Expense of ${formatMoney(
          parseFloat(newExpense.amount),
          currency,
        )} has been recorded.`,
      });

      setIsAddDialogOpen(false);
      setNewExpense({
        maintenanceRequestId: "",
        category: "",
        amount: "",
        paidBy: "",
        paymentMethod: "",
        receiptNumber: "",
      });

      // Refresh expenses list
      refetchExpenses();
    } catch (error) {
      toast({
        title: error.response.data.code,
        description:
          error.response.data.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Repairs: "bg-danger/20 text-danger",
      Utilities: "bg-primary/20 text-primary",
      Maintenance: "bg-warning/20 text-warning",
      Insurance: "bg-success/20 text-success",
      Security: "bg-purple-500/20 text-purple-500",
      Cleaning: "bg-blue-500/20 text-blue-500",
      Legal: "bg-orange-500/20 text-orange-500",
      Marketing: "bg-pink-500/20 text-pink-500",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (buildingsError || expensesError) {
    return (
      <ErrorState
        error={
          buildingsErrorObj?.message ||
          expensesErrorObj?.message ||
          "Failed to load data"
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentDate />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track property-related expenses
          </p>
        </div>

        <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </Button>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Maintenance Request *</Label>
                <Select
                  value={newExpense.maintenanceRequestId}
                  onValueChange={(value) =>
                    setNewExpense({
                      ...newExpense,
                      maintenanceRequestId: value,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance request" />
                  </SelectTrigger>
                  <SelectContent>
                    {requests.map((req) => (
                      <SelectItem key={req.id} value={req.id}>
                        {req.issue_title} ({req.building_name} - Unit{" "}
                        {req.unit_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Building (auto)</Label>
                <Input value={selectedRequest?.building_name || ""} disabled />
              </div>

              <div>
                <Label>Unit (auto)</Label>
                <Input value={selectedRequest?.unit_number || ""} disabled />
              </div>

              <div>
                <Label>Description (from request)</Label>
                <Textarea
                  value={selectedRequest?.description || ""}
                  disabled
                  rows={2}
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) =>
                    setNewExpense({ ...newExpense, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount ({currency}) *</Label>
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>

              <div>
                <Label>Paid By</Label>
                <Input
                  value={newExpense.paidBy}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, paidBy: e.target.value })
                  }
                  placeholder="e.g., Landlord, Tenant"
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <Input
                  value={newExpense.paymentMethod}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      paymentMethod: e.target.value,
                    })
                  }
                  placeholder="e.g., M-Pesa, Cash"
                />
              </div>

              <div>
                <Label>Receipt Number</Label>
                <Input
                  value={newExpense.receiptNumber}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      receiptNumber: e.target.value,
                    })
                  }
                  placeholder="e.g., MPESA ABC123"
                />
              </div>

              <Button
                onClick={handleAddExpense}
                className="w-full mt-4"
                disabled={addExpenseMutation.isPending}
              >
                {addExpenseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Expense"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-64 h-11">
            <Building2 className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🏢 All Buildings</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {getIconEmoji(b.icon)} {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3">Loading expenses...</span>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatMoney(totalExpenses, currency)}
                </p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {expenses.length}
                </p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card col-span-2">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Expenses by Category
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(expensesByCategory).map(
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg"
                    >
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-semibold",
                          getCategoryColor(category),
                        )}
                      >
                        {category}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formatMoney(amount, currency)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-foreground">All Expenses</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No expenses recorded yet{" "}
                {buildingFilter !== "all" ? `for this building` : ""}.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Building
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Unit
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Maintenance Request
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Description
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Paid By
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Method
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Receipt #
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-xs md:sm  py-4 px-4 text-foreground">
                      {formatDate(expense.date)}
                    </td>
                    <td className="text-xs md:sm  py-4 px-4 text-foreground">
                      {expense.building_name || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {expense.unit_number || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {expense.issue_title || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          getCategoryColor(expense.category || "Other"),
                        )}
                      >
                        {expense.category || "Other"}
                      </span>
                    </td>
                    <td className=" text-xs md:sm py-4 px-4 text-foreground">
                      {expense.description || "-"}
                    </td>
                    <td className=" text-xs md:sm py-4 px-4 text-muted-foreground">
                      {expense.paid_by || "-"}
                    </td>
                    <td className="text-xs md:sm  py-4 px-4 text-muted-foreground">
                      {expense.payment_method || "-"}
                    </td>
                    <td className="text-xs md:sm  py-4 px-4 text-muted-foreground">
                      {expense.receipt_number || "-"}
                    </td>
                    <td className="text-xs md:sm  py-4 px-4 text-right font-bold text-danger">
                      {formatMoney(expense.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
