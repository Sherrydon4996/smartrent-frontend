import React from "react";
import {
  X,
  CreditCard,
  Droplets,
  Trash2,
  AlertTriangle,
  Home,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { PaymentTransaction } from "@/pages/monthlyUpdates/types";
import { useAppSelector } from "@/store/hooks";
import { formatDate, formatMoney } from "@/utils/utils";

interface MonthlyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string;
  monthKey: string;
  payments: PaymentTransaction[];
  expectedRent: number;
  tenantName: string;
}

export function MonthlyBreakdownModal({
  isOpen,
  onClose,
  monthName,
  monthKey,
  payments,
  expectedRent,
  tenantName,
}: MonthlyBreakdownModalProps) {
  const currency = useAppSelector((state) => state.settingsQ.currency);

  // Group payments by type
  const rentPayments = payments.filter((p) => p.type === "rent");
  const waterPayments = payments.filter((p) => p.type === "water");
  const garbagePayments = payments.filter((p) => p.type === "garbage");
  const depositPayments = payments.filter((p) => p.type === "deposit");
  const penaltyPayments = payments.filter((p) => p.type === "penalty");

  const totalRent = rentPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalWater = waterPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalGarbage = garbagePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDeposit = depositPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPenalties = penaltyPayments.reduce((sum, p) => sum + p.amount, 0);
  const grandTotal =
    totalRent + totalWater + totalGarbage + totalDeposit + totalPenalties;

  const rentStatus =
    totalRent >= expectedRent ? "paid" : totalRent > 0 ? "partial" : "unpaid";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {monthName} Breakdown
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{tenantName}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary Card */}
          <div
            className={cn(
              "p-4 rounded-lg border-2",
              rentStatus === "paid"
                ? "bg-success/10 border-success/30"
                : rentStatus === "partial"
                  ? "bg-warning/10 border-warning/30"
                  : "bg-danger/10 border-danger/30",
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    rentStatus === "paid"
                      ? "bg-success/20 text-success"
                      : rentStatus === "partial"
                        ? "bg-warning/20 text-warning"
                        : "bg-danger/20 text-danger",
                  )}
                >
                  {rentStatus === "paid"
                    ? "Fully Paid"
                    : rentStatus === "partial"
                      ? "Partial Payment"
                      : "Unpaid"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-foreground">
                  {formatMoney(grandTotal, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown by Type */}
          <div className="space-y-3">
            {/* Rent */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Rent</span>
                </div>
                <span className="font-bold text-foreground">
                  {formatMoney(totalRent, currency)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Expected: {formatMoney(expectedRent, currency)} |{" "}
                {rentStatus === "paid"
                  ? "✓ Complete"
                  : `Outstanding: ${formatMoney(expectedRent - totalRent, currency)}`}
              </div>
              {rentPayments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {rentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-xs bg-background/50 p-2 rounded"
                    >
                      <span>
                        {formatDate(p.date)} •{" "}
                        {p.method.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-success">
                        {formatMoney(p.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Water */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-foreground">Water</span>
                </div>
                <span className="font-bold text-foreground">
                  {formatMoney(totalWater, currency)}
                </span>
              </div>
              {waterPayments.length > 0 && (
                <div className="space-y-1">
                  {waterPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-xs bg-background/50 p-2 rounded"
                    >
                      <span>
                        {formatDate(p.date)} •{" "}
                        {p.method.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-success">
                        {formatMoney(p.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {waterPayments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No water payments this month
                </p>
              )}
            </div>

            {/* Garbage */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-foreground">Garbage</span>
                </div>
                <span className="font-bold text-foreground">
                  {formatMoney(totalGarbage, currency)}
                </span>
              </div>
              {garbagePayments.length > 0 && (
                <div className="space-y-1">
                  {garbagePayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-xs bg-background/50 p-2 rounded"
                    >
                      <span>
                        {formatDate(p.date)} •{" "}
                        {p.method.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-success">
                        {formatMoney(p.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {garbagePayments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No garbage payments this month
                </p>
              )}
            </div>

            {/* Deposit (if any) */}
            {depositPayments.length > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Deposit</span>
                  </div>
                  <span className="font-bold text-primary">
                    {formatMoney(totalDeposit, currency)}
                  </span>
                </div>
                <div className="space-y-1">
                  {depositPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-xs bg-background/50 p-2 rounded"
                    >
                      <span>
                        {formatDate(p.date)} •{" "}
                        {p.method.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-primary">
                        {formatMoney(p.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Penalties (if any) */}
            {penaltyPayments.length > 0 && (
              <div className="p-3 bg-danger/10 rounded-lg border border-danger/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <span className="font-medium text-danger">Penalties</span>
                  </div>
                  <span className="font-bold text-danger">
                    {formatMoney(totalPenalties, currency)}
                  </span>
                </div>
                <div className="space-y-1">
                  {penaltyPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-xs bg-background/50 p-2 rounded"
                    >
                      <span>
                        {formatDate(p.date)} •{" "}
                        {p.method.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-danger">
                        {formatMoney(p.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No payments message */}
            {payments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No payments recorded for this month
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
