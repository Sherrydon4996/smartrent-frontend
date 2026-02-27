import React from "react";
import { Calendar, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tenant } from "@/pages/TenantPage/types";
import { useAppSelector } from "@/store/hooks";
import { formatMoney } from "@/utils/utils";

interface PaymentHistoryModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  mpesa: "M-Pesa",
  cash: "Cash",
  bank: "Bank Transfer",
  equity: "Equity Bank",
  kcb: "KCB Bank",
  cooperative: "Co-op Bank",
  family_bank: "Family Bank",
};

export function PaymentHistoryModal({
  tenant,
  isOpen,
  onClose,
}: PaymentHistoryModalProps) {
  const currency = useAppSelector((state) => state.settingsQ.currency);

  // Get transactions from tenant object
  const tenantTransactions = tenant.transactions || [];

  // Calculate total paid from all transactions
  const totalPaid = tenantTransactions.reduce(
    (sum, tx) => sum + (parseFloat(tx.TotalAmount) || 0),
    0,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment History - {tenant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold text-success">
                {formatMoney(totalPaid, currency)}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold text-foreground">
                {tenantTransactions.length}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p className="text-xl font-bold text-danger">
                {formatMoney(tenant.balanceDue || 0, currency)}
              </p>
            </div>
          </div>

          {/* Transaction List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {tenantTransactions.map((transaction) => {
                const rentAmount = parseFloat(transaction.rent) || 0;
                const waterAmount = parseFloat(transaction.water) || 0;
                const garbageAmount = parseFloat(transaction.garbage) || 0;
                const penaltyAmount = parseFloat(transaction.penalty) || 0;
                const depositAmount = parseFloat(transaction.deposit) || 0;
                const totalAmount = parseFloat(transaction.TotalAmount) || 0;

                return (
                  <div
                    key={transaction.id}
                    className="p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-primary">
                            {METHOD_LABELS[transaction.method] ||
                              transaction.method}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Ref: {transaction.reference || "N/A"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.date).toLocaleDateString(
                            "en-KE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                          {" • "}
                          {new Date(transaction.timestamp).toLocaleTimeString(
                            "en-KE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-success">
                          {formatMoney(totalAmount, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Paid
                        </p>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="border-t border-border pt-3 space-y-1.5">
                      {rentAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rent</span>
                          <span className="font-medium">
                            {formatMoney(rentAmount, currency)}
                          </span>
                        </div>
                      )}
                      {waterAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Water</span>
                          <span className="font-medium">
                            {formatMoney(waterAmount, currency)}
                          </span>
                        </div>
                      )}
                      {garbageAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Garbage</span>
                          <span className="font-medium">
                            {formatMoney(garbageAmount, currency)}
                          </span>
                        </div>
                      )}
                      {penaltyAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-danger">Penalty</span>
                          <span className="font-medium text-danger">
                            {formatMoney(penaltyAmount, currency)}
                          </span>
                        </div>
                      )}
                      {depositAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Deposit</span>
                          <span className="font-medium">
                            {formatMoney(depositAmount, currency)}
                          </span>
                        </div>
                      )}
                      {transaction.notes && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground italic">
                            Note: {transaction.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {tenantTransactions.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No transactions recorded
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payments for this tenant will appear here
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
