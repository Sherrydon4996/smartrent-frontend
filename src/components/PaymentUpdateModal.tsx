import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { PAYMENT_METHODS, formatMoney, icons } from "@/utils/utils";
import { cn } from "@/lib/utils";
import { api } from "@/Apis/axiosApi";
import { TenantMonthlyRecord } from "@/pages/monthlyUpdates/types";
import { Tenant } from "@/pages/TenantPage/types";
import { useUpsertTransaction } from "@/hooks/useTenantPaymentApi";

interface PaymentUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  record: TenantMonthlyRecord | null;
  selectedMonth: string;
  selectedYear: number;
}

export function PaymentUpdateModal({
  isOpen,
  onClose,
  tenant,
  record,
  selectedMonth,
  selectedYear,
}: PaymentUpdateModalProps) {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const upsertMutation = useUpsertTransaction();

  const { toast } = useToast();

  const [paymentForm, setPaymentForm] = useState({
    rentAmount: 0,
    waterAmount: 0,
    waterBillAmount: 0,
    garbageAmount: 0,
    penaltyAmount: 0,
    depositAmount: 0,
    method: "mpesa",
    reference: "",
    notes: "",
  });

  const [isNewTenant, setIsNewTenant] = useState(false);
  const [updateWaterBill, setUpdateWaterBill] = useState(false);
  const [currentWaterBill, setCurrentWaterBill] = useState(0);
  const [creditAdded, setCreditAdded] = useState<number>(0);
  const [isSettling, setIsSettling] = useState(false);

  const currency = useAppSelector((state) => state.settingsQ.currency);

  useEffect(() => {
    if (record) {
      const waterBill = record.waterBill || 0;
      setCurrentWaterBill(waterBill);
      setPaymentForm((prev) => ({
        ...prev,
        waterBillAmount: waterBill,
      }));
    }
  }, [record]);

  const handleClose = () => {
    setPaymentForm({
      rentAmount: 0,
      waterAmount: 0,
      waterBillAmount: 0,
      garbageAmount: 0,
      penaltyAmount: 0,
      depositAmount: 0,
      method: "mpesa",
      reference: "",
      notes: "",
    });
    setIsNewTenant(false);
    setUpdateWaterBill(false);
    setCreditAdded(0);
    onClose();
  };

  const handleSettlePayment = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only admins are allowed to make changes in the system.",
        variant: "destructive",
      });
      return;
    }
    if (!tenant || !record) return;

    setIsSettling(true);

    try {
      const response = await api.post("/api/v1/admin/transactions/settle", {
        tenantId: tenant.id,
        month: selectedMonth,
        year: selectedYear,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Settlement failed");
      }

      const { settlements, remainingTenantCredit, totalSettled } =
        response.data;

      const settledItems = [];
      if (settlements.rent)
        settledItems.push(`Rent: ${formatMoney(settlements.rent, currency)}`);
      if (settlements.garbage)
        settledItems.push(
          `Garbage: ${formatMoney(settlements.garbage, currency)}`,
        );
      if (settlements.water)
        settledItems.push(`Water: ${formatMoney(settlements.water, currency)}`);

      toast({
        title: "Payment Settled Successfully",
        variant: "success",
        description: `Settled ${formatMoney(totalSettled, currency)} from credit balance. ${settledItems.join(", ")}. Remaining credit: ${formatMoney(remainingTenantCredit, currency)}`,
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "Settlement Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to settle payment",
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  };

  const calculateBalances = () => {
    if (!tenant || !record) return null;

    const waterBill = updateWaterBill
      ? paymentForm.waterBillAmount
      : currentWaterBill;

    const garbageBill = tenant.garbageBill;
    const penalties = record.penalties || 0;
    const totalMonthlyDue =
      tenant.monthlyRent + waterBill + garbageBill + penalties;

    const alreadyPaidRent = record.rentPaid || 0;
    const alreadyPaidWater = record.waterPaid || 0;
    const alreadyPaidGarbage = record.garbagePaid || 0;
    const alreadyPaidPenalties = record.penaltiesPaid || 0;
    const totalAlreadyPaid =
      alreadyPaidRent +
      alreadyPaidWater +
      alreadyPaidGarbage +
      alreadyPaidPenalties;

    const newRent = paymentForm.rentAmount;
    const newWater = paymentForm.waterAmount;
    const newGarbage = paymentForm.garbageAmount;
    const newPenalty = paymentForm.penaltyAmount;
    const newTotal = newRent + newWater + newGarbage + newPenalty;

    const remainingRent = tenant.monthlyRent - alreadyPaidRent;
    const remainingWater = waterBill - alreadyPaidWater;
    const remainingGarbage = garbageBill - alreadyPaidGarbage;
    const remainingPenalties = penalties - alreadyPaidPenalties;
    const totalRemaining =
      remainingRent + remainingWater + remainingGarbage + remainingPenalties;

    const amounts = {
      rent: newRent,
      water: newWater,
      garbage: newGarbage,
      penalty: newPenalty,
    };

    const remainings = {
      rent: remainingRent,
      water: remainingWater,
      garbage: remainingGarbage,
      penalty: remainingPenalties,
    };

    const effectives = { rent: 0, water: 0, garbage: 0, penalty: 0 };
    let excess = 0;

    Object.keys(amounts).forEach((cat) => {
      const newAm = amounts[cat];
      const rem = remainings[cat];
      effectives[cat] = Math.min(newAm, rem);
      excess += newAm - effectives[cat];
      remainings[cat] -= effectives[cat];
    });

    const order = ["penalty", "water", "garbage", "rent"];

    while (excess > 0) {
      let allocated = false;
      order.forEach((cat) => {
        if (remainings[cat] > 0 && excess > 0) {
          const add = Math.min(excess, remainings[cat]);
          effectives[cat] += add;
          remainings[cat] -= add;
          excess -= add;
          allocated = true;
        }
      });
      if (!allocated) break;
    }

    const effectiveTotal = Object.values(effectives).reduce(
      (sum, val) => sum + val,
      0,
    );

    const balance = totalRemaining - effectiveTotal;
    const newBalanceDue = balance > 0 ? balance : 0;
    const advanceAmount = excess;

    return {
      totalMonthlyDue,
      totalAlreadyPaid,
      newTotal,
      newBalanceDue,
      advanceAmount,
      waterBill,
      remainingRent,
      remainingWater,
      remainingGarbage,
      remainingPenalties,
      effectives,
    };
  };

  const handleSaveRecord = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only admins are allowed to make changes in the system.",
        variant: "destructive",
      });
      return;
    }
    if (!tenant || !record) return;

    const calculations = calculateBalances();
    if (!calculations) return;

    const totalNewPayment = calculations.newTotal;

    if (totalNewPayment === 0 && !updateWaterBill) {
      toast({
        title: "No payment or update entered",
        description:
          "Please enter at least one payment amount or update the water bill.",
        variant: "destructive",
      });
      return;
    }

    if (
      paymentForm.method !== "cash" &&
      !paymentForm.reference.trim() &&
      totalNewPayment > 0
    ) {
      toast({
        title: "Reference required",
        description: "Please enter a payment reference.",
        variant: "destructive",
      });
      return;
    }

    const reference =
      paymentForm.method === "cash"
        ? `CASH-${Date.now().toString().slice(-8)}`
        : paymentForm.reference;

    const now = new Date();
    const transactionId = `TXN-${Date.now()}`;
    const dateStr = now.toISOString().split("T")[0];
    const timestamp = now.toISOString();

    const transactionData = {
      id: transactionId,
      tenant_id: tenant.id,
      waterBill: calculations.waterBill,
      TotalAmount: totalNewPayment,
      rent: paymentForm.rentAmount.toString(),
      water: paymentForm.waterAmount.toString(),
      garbage: paymentForm.garbageAmount.toString(),
      penalty: paymentForm.penaltyAmount.toString(),
      deposit: paymentForm.depositAmount.toString(),
      method: paymentForm.method,
      reference,
      date: dateStr,
      timestamp,
      month: selectedMonth,
      year: selectedYear,
      notes: paymentForm.notes || "",
    };

    const updatedRecord: TenantMonthlyRecord = {
      ...record,
      tenantId: tenant.id,
      name: tenant.name,
      houseNumber: tenant.houseNumber,
      mobile: tenant.mobile,
      buildingName: tenant.buildingName,
      monthlyRent: tenant.monthlyRent,
      month: selectedMonth,
      year: selectedYear,
      waterBill: calculations.waterBill,
      rentPaid: (record.rentPaid || 0) + calculations.effectives.rent,
      waterPaid: (record.waterPaid || 0) + calculations.effectives.water,
      garbagePaid: (record.garbagePaid || 0) + calculations.effectives.garbage,
      depositPaid: (record.depositPaid || 0) + paymentForm.depositAmount,
      penaltiesPaid:
        (record.penaltiesPaid || 0) + calculations.effectives.penalty,
      penalties: record.penalties || 0,
      balanceDue: calculations.newBalanceDue,
      advanceBalance: 0,
      transactions: [
        ...(record.transactions || []),
        {
          id: transactionId,
          tenantId: tenant.id,
          amount: totalNewPayment,
          type: "rent",
          method: paymentForm.method,
          reference,
          date: dateStr,
          timestamp,
          month: selectedMonth,
          year: selectedYear,
          notes: paymentForm.notes,
        },
      ],
      lastUpdated: timestamp,
      carriedForward: 0,
      effectiveRentPaid: (record.rentPaid || 0) + calculations.effectives.rent,
      effectiveWaterPaid:
        (record.waterPaid || 0) + calculations.effectives.water,
      effectiveGarbagePaid:
        (record.garbagePaid || 0) + calculations.effectives.garbage,
      effectivePenaltiesPaid:
        (record.penaltiesPaid || 0) + calculations.effectives.penalty,
    };

    try {
      const result = await upsertMutation.mutateAsync({
        tenantId: tenant.id,
        transaction: transactionData,
        record: updatedRecord,
      });

      if (result.creditAdded && result.creditAdded > 0) {
        setCreditAdded(result.creditAdded);
      }

      const updateMessage = updateWaterBill
        ? ` | Water bill updated to ${formatMoney(calculations.waterBill, currency)}`
        : "";

      let creditMessage = "";
      if (result.creditAdded && result.creditAdded > 0) {
        creditMessage = ` | ${formatMoney(result.creditAdded, currency)} added to tenant credit`;
      }

      toast({
        title: "Payment Recorded Successfully",
        variant: "success",
        description: `${
          totalNewPayment > 0
            ? formatMoney(totalNewPayment, currency) + " recorded for"
            : "Updated"
        } ${tenant.name} - ${selectedMonth} ${selectedYear}${updateMessage}${creditMessage}`,
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save payment record",
        variant: "destructive",
      });
    }
  };

  if (!tenant || !record) return null;

  const calculations = calculateBalances();

  const canSettle = record.advanceBalance > 0 && record.balanceDue > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Payment - {tenant.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!isAdmin && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-400 rounded-md text-amber-800 dark:text-amber-300 text-sm">
              <p className="font-medium">View-only mode</p>
              <p>Only administrators can record or update payments.</p>
            </div>
          )}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">
                  {tenant.houseNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedMonth} {selectedYear}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/tenants/${tenant.id}`)}
              >
                <icons.eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </div>

          {canSettle && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-500">
              <div className="flex items-start gap-2 mb-3">
                <icons.alertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Advance Balance Available
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    You have {formatMoney(record.advanceBalance, currency)} in
                    advance that can be applied to the outstanding balance of{" "}
                    {formatMoney(record.balanceDue, currency)}.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSettlePayment}
                disabled={isSettling}
                className="w-full"
                variant="default"
              >
                {isSettling ? (
                  <>
                    <icons.loader className="w-4 h-4 mr-2 animate-spin" />
                    Settling...
                  </>
                ) : (
                  <>
                    <icons.checkCircle className="w-4 h-4 mr-2" />
                    Settle Payment with Advance
                  </>
                )}
              </Button>
            </div>
          )}

          {creditAdded > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-500">
              <div className="flex items-start gap-2">
                <icons.checkCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-700 dark:text-green-300 mb-1">
                    Credit Added Successfully
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formatMoney(creditAdded, currency)} has been added to{" "}
                    {tenant.name}'s credit balance and can be used for future
                    settlements.
                  </p>
                </div>
              </div>
            </div>
          )}

          <>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground mb-2">
                Monthly Dues
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Rent</p>
                  <p className="font-medium">
                    {formatMoney(tenant.monthlyRent, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Water</p>
                  <p className="font-medium">
                    {formatMoney(currentWaterBill, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Garbage</p>
                  <p className="font-medium">
                    {formatMoney(tenant.garbageBill, currency)}
                  </p>
                </div>
              </div>
              {calculations && (
                <div className="mt-2 pt-2 border-t border-primary/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Due:</span>
                    <span className="font-semibold">
                      {formatMoney(calculations.totalMonthlyDue, currency)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="updateWaterBill"
                  checked={updateWaterBill}
                  onCheckedChange={(checked) => {
                    setUpdateWaterBill(checked === true);
                    if (!checked) {
                      setPaymentForm({
                        ...paymentForm,
                        waterBillAmount: currentWaterBill,
                      });
                    }
                  }}
                />
                <Label
                  htmlFor="updateWaterBill"
                  className="text-sm flex items-center gap-2 cursor-pointer font-medium"
                >
                  <icons.droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Update this month's water bill
                </Label>
              </div>
              {updateWaterBill && (
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">
                    New Water Bill Amount
                  </Label>
                  <Input
                    type="number"
                    value={paymentForm.waterBillAmount || ""}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        waterBillAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter water bill amount"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current water bill:{" "}
                    {formatMoney(currentWaterBill, currency)}
                  </p>
                </div>
              )}
            </div>

            {(record.rentPaid > 0 ||
              record.waterPaid > 0 ||
              record.garbagePaid > 0) && (
              <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                <p className="text-sm font-medium text-foreground mb-2">
                  Already Paid This Month
                </p>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rent</p>
                    <p className="font-medium text-success">
                      {formatMoney(record.rentPaid, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Water</p>
                    <p className="font-medium text-success">
                      {formatMoney(record.waterPaid, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Garbage</p>
                    <p className="font-medium text-success">
                      {formatMoney(record.garbagePaid, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p
                      className={cn(
                        "font-medium",
                        record.balanceDue > 0 ? "text-danger" : "text-success",
                      )}
                    >
                      {formatMoney(record.balanceDue, currency)}
                    </p>
                  </div>
                </div>
                {record.advanceBalance > 0 && (
                  <div className="mt-2 pt-2 border-t border-success/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Advance Balance:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {formatMoney(record.advanceBalance, currency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Add New Payment
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1 text-xs">
                    <icons.dollarSign className="w-3 h-3" /> Rent Amount
                  </Label>
                  <Input
                    type="number"
                    value={paymentForm.rentAmount || ""}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        rentAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  {calculations && calculations.remainingRent > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining:{" "}
                      {formatMoney(calculations.remainingRent, currency)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs">
                    <icons.droplets className="w-3 h-3" /> Water Payment
                  </Label>
                  <Input
                    type="number"
                    value={paymentForm.waterAmount || ""}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        waterAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  {calculations && calculations.remainingWater > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining:{" "}
                      {formatMoney(calculations.remainingWater, currency)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs">
                    <icons.trash2 className="w-3 h-3" /> Garbage Amount
                  </Label>
                  <Input
                    type="number"
                    value={paymentForm.garbageAmount || ""}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        garbageAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  {calculations && calculations.remainingGarbage > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining:{" "}
                      {formatMoney(calculations.remainingGarbage, currency)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs">
                    <icons.alertTriangle className="w-3 h-3" /> Penalty Amount
                  </Label>
                  <Input
                    type="number"
                    value={paymentForm.penaltyAmount || ""}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        penaltyAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  {calculations && calculations.remainingPenalties > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining:{" "}
                      {formatMoney(calculations.remainingPenalties, currency)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <Checkbox
                  id="newTenant"
                  checked={isNewTenant}
                  onCheckedChange={(checked) => {
                    setIsNewTenant(checked === true);
                    if (!checked) {
                      setPaymentForm({ ...paymentForm, depositAmount: 0 });
                    }
                  }}
                />
                <Label
                  htmlFor="newTenant"
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <icons.userPlus className="w-4 h-4 text-primary" />
                  New tenant (include deposit payment)
                </Label>
              </div>

              {isNewTenant && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Label className="flex items-center gap-1 text-xs">
                    <icons.creditcard className="w-3 h-3" /> Deposit Amount
                  </Label>
                  <Input
                    type="number"
                    value={paymentForm.depositAmount || ""}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        depositAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the security deposit for the new tenant
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(v) =>
                      setPaymentForm({
                        ...paymentForm,
                        method: v,
                        reference: v === "cash" ? "" : paymentForm.reference,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">
                    Reference {paymentForm.method !== "cash" && "*"}
                  </Label>
                  <Input
                    value={paymentForm.reference}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        reference: e.target.value,
                      })
                    }
                    placeholder={
                      paymentForm.method === "cash"
                        ? "Auto-generated"
                        : "e.g. MPESA123456"
                    }
                    disabled={paymentForm.method === "cash"}
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label className="text-xs">Notes (Optional)</Label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            {calculations && calculations.newTotal > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm font-medium text-foreground mb-2">
                  Transaction Summary
                </p>
                <div className="space-y-1 text-sm">
                  {calculations.effectives.rent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rent</span>
                      <span>
                        {formatMoney(calculations.effectives.rent, currency)}
                      </span>
                    </div>
                  )}
                  {calculations.effectives.water > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Water</span>
                      <span>
                        {formatMoney(calculations.effectives.water, currency)}
                      </span>
                    </div>
                  )}
                  {calculations.effectives.garbage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Garbage</span>
                      <span>
                        {formatMoney(calculations.effectives.garbage, currency)}
                      </span>
                    </div>
                  )}
                  {calculations.effectives.penalty > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Penalty</span>
                      <span>
                        {formatMoney(calculations.effectives.penalty, currency)}
                      </span>
                    </div>
                  )}
                  {paymentForm.depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit</span>
                      <span>
                        {formatMoney(paymentForm.depositAmount, currency)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total Payment</span>
                    <span className="text-primary">
                      {formatMoney(calculations.newTotal, currency)}
                    </span>
                  </div>

                  <Separator className="my-2" />
                  {calculations.newBalanceDue > 0 ? (
                    <div className="flex justify-between font-semibold text-red-600">
                      <span>Remaining Balance:</span>
                      <span>
                        {formatMoney(calculations.newBalanceDue, currency)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Fully Paid ✓</span>
                      <span>{formatMoney(0, currency)}</span>
                    </div>
                  )}
                  {calculations.advanceAmount > 0 && (
                    <div className="flex justify-between font-semibold text-green-600 mt-1 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <span>Advance (added to credit):</span>
                      <span>
                        +{formatMoney(calculations.advanceAmount, currency)}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Date:{" "}
                    {new Date().toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    at {new Date().toLocaleTimeString("en-KE")}
                  </p>
                </div>
              </div>
            )}

            {record.transactions && record.transactions.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Previous Transactions
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {record.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center text-xs p-2 bg-background rounded border"
                    >
                      <div>
                        <span className="font-medium capitalize">
                          {tx.type}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {tx.reference}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatMoney(tx.amount, currency)}
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSaveRecord}
              className="w-full"
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending ? (
                <>
                  <icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <icons.save className="w-4 h-4 mr-2" />
                  Save Record
                </>
              )}
            </Button>
          </>
        </div>
      </DialogContent>
    </Dialog>
  );
}
