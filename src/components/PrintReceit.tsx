import React, { useRef, useState } from "react";
import { Printer, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tenant } from "@/pages/TenantPage/types";
import { api } from "@/Apis/axiosApi";
import { AlertTriangle, Loader, Info } from "lucide-react";

interface PrintReceiptProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  month: string;
  year: number;
}

export function PrintReceipt({
  tenant,
  isOpen,
  onClose,
  month,
  year,
}: PrintReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const receiptNo = `RCP-${year}${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${tenant.id.slice(0, 8).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const monthlyRent = tenant.monthlyRent || 0;
  const waterBill = tenant.waterBill || 0;
  const garbageBill = tenant.garbageBill || 0;
  const penalties = tenant.penalties || 0;
  const totalDue = monthlyRent + waterBill + garbageBill + penalties;
  const amountPaid = totalDue - (tenant.balanceDue || 0);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${tenant.name}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 30px; max-width: 560px; margin: 0 auto; color: #111; }
            .receipt-header { text-align: center; border-bottom: 2px solid #007BFF; padding-bottom: 16px; margin-bottom: 16px; }
            .receipt-header h1 { color: #007BFF; margin: 0; font-size: 22px; }
            .receipt-header p { color: #666; margin: 4px 0 0; font-size: 13px; }
            .receipt-meta { text-align: right; color: #666; font-size: 11px; margin-bottom: 16px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
            .detail-label { color: #555; }
            .detail-value { font-weight: 600; }
            .breakdown-box { background: #f8f9fa; padding: 12px; margin-top: 16px; border-radius: 6px; }
            .breakdown-title { font-weight: 700; font-size: 14px; margin: 0 0 10px; }
            .total-box { background: #28A745; color: white; padding: 12px; margin-top: 12px; border-radius: 6px; }
            .total-row { display: flex; justify-content: space-between; font-size: 16px; }
            .balance-row { display: flex; justify-content: space-between; font-size: 13px; color: #FFD700; margin-top: 6px; }
            .status-badge { text-align: center; margin-top: 20px; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 14px; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 11px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>SmartRent Manager</h1>
            <p>Rental Payment Receipt</p>
          </div>
          <div class="receipt-meta">
            Receipt No: ${receiptNo}<br/>Date: ${currentDate}
          </div>
          <div class="detail-row"><span class="detail-label">Tenant Name:</span><span class="detail-value">${tenant.name}</span></div>
          <div class="detail-row"><span class="detail-label">Phone Number:</span><span class="detail-value">${tenant.mobile || "N/A"}</span></div>
          <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${tenant.email || "N/A"}</span></div>
          <div class="detail-row"><span class="detail-label">House Number:</span><span class="detail-value">${tenant.houseNumber}</span></div>
          <div class="detail-row"><span class="detail-label">Building:</span><span class="detail-value">${tenant.buildingName}</span></div>
          <div class="detail-row"><span class="detail-label">House Type:</span><span class="detail-value">${tenant.houseSize}</span></div>
          <div class="detail-row"><span class="detail-label">Area:</span><span class="detail-value">${tenant.area || "N/A"}</span></div>
          <div class="detail-row"><span class="detail-label">Payment Period:</span><span class="detail-value">${month} ${year}</span></div>
          <div class="breakdown-box">
            <p class="breakdown-title">Payment Breakdown</p>
            <div class="detail-row"><span class="detail-label">Monthly Rent:</span><span class="detail-value">KES ${monthlyRent.toLocaleString()}</span></div>
            <div class="detail-row"><span class="detail-label">Water Bill:</span><span class="detail-value">KES ${waterBill.toLocaleString()}</span></div>
            <div class="detail-row"><span class="detail-label">Garbage Fee:</span><span class="detail-value">KES ${garbageBill.toLocaleString()}</span></div>
            ${penalties > 0 ? `<div class="detail-row" style="color:#DC3545"><span class="detail-label">Penalties:</span><span class="detail-value">KES ${penalties.toLocaleString()}</span></div>` : ""}
            <div class="detail-row" style="border-top:2px solid #ddd;margin-top:8px;padding-top:10px;font-weight:700"><span>Total Due:</span><span>KES ${totalDue.toLocaleString()}</span></div>
          </div>
          <div class="total-box">
            <div class="total-row"><span>Amount Paid:</span><span style="font-size:20px">KES ${amountPaid.toLocaleString()}</span></div>
            ${tenant.balanceDue > 0 ? `<div class="balance-row"><span>Balance Remaining:</span><span>KES ${tenant.balanceDue.toLocaleString()}</span></div>` : ""}
          </div>
          <div class="status-badge" style="background:${tenant.balanceDue === 0 ? "#28A745" : "#FFA500"}">
            ${tenant.balanceDue === 0 ? "✓ FULLY PAID" : `⚠ PARTIAL PAYMENT - Balance: KES ${tenant.balanceDue.toLocaleString()}`}
          </div>
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>SmartRent Manager - Professional Rental Management</p>
            <p style="margin-top:8px;font-size:10px">This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendEmail = async () => {
    if (!tenant.email) {
      toast({
        title: "No Email Found",
        description: "This tenant does not have an email address on record.",
        variant: "destructive",
      });
      return;
    }
    setIsSending(true);
    try {
      const response = await api.post("/api/v1/admin/receipts/send-email", {
        email: tenant.email,
        tenantId: tenant.id,
        tenantName: tenant.name,
        month,
        year,
        receiptData: {
          receiptNo,
          monthlyRent,
          waterBill,
          garbageBill,
          penalties,
          totalDue,
          amountPaid,
          balanceDue: tenant.balanceDue,
          houseNumber: tenant.houseNumber,
          buildingName: tenant.buildingName,
        },
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Failed to send email");
      toast({
        title: "Email Sent Successfully",
        description: `Receipt sent to ${tenant.email}`,
        variant: "success",
      });
      setShowEmailDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to Send Email",
        description:
          error.response?.data?.message ||
          error.message ||
          "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!tenant.mobile) {
      toast({
        title: "No Phone Number Found",
        description: "This tenant does not have a mobile number on record.",
        variant: "destructive",
      });
      return;
    }
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(tenant.mobile.replace(/\s/g, ""))) {
      toast({
        title: "Invalid Phone Format",
        description:
          "The stored phone number appears invalid. Please update tenant profile.",
        variant: "destructive",
      });
      return;
    }
    setIsSending(true);
    try {
      const response = await api.post("/api/v1/admin/receipts/send-sms", {
        phone: tenant.mobile,
        tenantName: tenant.name,
        month,
        year,
        amountPaid,
        balanceDue: tenant.balanceDue,
        receiptNo,
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Failed to send SMS");
      const data = response.data;
      toast({
        title: "SMS Sent Successfully",
        description: `Receipt notification sent to ${tenant.mobile}. ${data.cost ? `Cost: KES ${data.cost}` : ""}`,
        variant: "success",
      });
      setShowSMSDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to Send SMS",
        description:
          error.response?.data?.message ||
          error.message ||
          "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Reusable row component
  const DetailRow = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: string;
    highlight?: string;
  }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 gap-2">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-sm font-semibold text-right break-all ${highlight || "text-gray-800"}`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-xl mx-auto max-h-[95vh] overflow-y-auto p-0 sm:p-0">
          {/* Header toolbar */}
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-base font-semibold">
              Payment Receipt
            </DialogTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handlePrint}
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print
              </Button>
              <Button
                onClick={() => setShowEmailDialog(true)}
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none text-xs"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email
              </Button>
              <Button
                onClick={() => setShowSMSDialog(true)}
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                SMS
              </Button>
            </div>
          </div>

          {/* Receipt body */}
          <div
            ref={receiptRef}
            className="bg-white text-gray-900 px-4 py-5 sm:px-6"
          >
            {/* Brand header */}
            <div className="text-center border-b-2 border-blue-500 pb-4 mb-4">
              <h2 className="text-xl font-bold text-blue-600">
                SmartRent Manager
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Rental Payment Receipt
              </p>
            </div>

            {/* Receipt meta */}
            <div className="text-right text-xs text-gray-400 mb-4 leading-relaxed">
              <div>
                Receipt No:{" "}
                <span className="font-medium text-gray-600">{receiptNo}</span>
              </div>
              <div>
                Date:{" "}
                <span className="font-medium text-gray-600">{currentDate}</span>
              </div>
            </div>

            {/* Tenant details */}
            <div className="mb-4">
              <DetailRow label="Tenant Name" value={tenant.name} />
              <DetailRow label="Phone" value={tenant.mobile || "N/A"} />
              <DetailRow label="Email" value={tenant.email || "N/A"} />
              <DetailRow label="House Number" value={tenant.houseNumber} />
              <DetailRow label="Building" value={tenant.buildingName} />
              <DetailRow label="House Type" value={tenant.houseSize} />
              <DetailRow label="Area" value={tenant.area || "N/A"} />
              <DetailRow label="Payment Period" value={`${month} ${year}`} />
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Payment Breakdown
              </h3>
              <DetailRow
                label="Monthly Rent"
                value={`KES ${monthlyRent.toLocaleString()}`}
              />
              <DetailRow
                label="Water Bill"
                value={`KES ${waterBill.toLocaleString()}`}
              />
              <DetailRow
                label="Garbage Fee"
                value={`KES ${garbageBill.toLocaleString()}`}
              />
              {penalties > 0 && (
                <DetailRow
                  label="Penalties"
                  value={`KES ${penalties.toLocaleString()}`}
                  highlight="text-red-500"
                />
              )}
              <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-200">
                <span className="text-sm font-bold text-gray-700">
                  Total Due
                </span>
                <span className="text-sm font-bold text-gray-900">
                  KES {totalDue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Amount paid */}
            <div className="bg-green-600 text-white rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium opacity-90">
                  Amount Paid
                </span>
                <span className="text-2xl font-bold">
                  KES {amountPaid.toLocaleString()}
                </span>
              </div>
              {tenant.balanceDue > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-500">
                  <span className="text-xs font-medium text-yellow-200">
                    Balance Remaining
                  </span>
                  <span className="text-base font-bold text-yellow-300">
                    KES {tenant.balanceDue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Status badge */}
            {tenant.balanceDue === 0 ? (
              <div className="rounded-lg bg-green-600 text-white text-center py-3 font-bold text-sm tracking-wide mb-4">
                ✓ FULLY PAID
              </div>
            ) : (
              <div className="rounded-lg bg-orange-400 text-white text-center py-3 font-bold text-sm tracking-wide mb-4">
                ⚠ PARTIAL PAYMENT — Balance: KES{" "}
                {tenant.balanceDue.toLocaleString()}
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs space-y-1 pt-2 border-t border-gray-100">
              <p>Thank you for your payment!</p>
              <p>SmartRent Manager — Professional Rental Management</p>
              <p className="text-[10px] mt-1">
                This is a computer-generated receipt and does not require a
                signature.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Send Receipt via Email
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 mt-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <Info className="w-4 h-4 inline mr-1" />
                    Email delivery is <strong>free</strong> and instant.
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recipient Email</Label>
                  <div className="mt-1 p-2 bg-muted rounded border text-sm break-all">
                    {tenant.email || "No email address on record"}
                  </div>
                  {!tenant.email && (
                    <p className="text-xs text-destructive mt-1">
                      Please add an email to this tenant's profile first.
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <strong>Receipt for:</strong> {tenant.name}
                  <br />
                  <strong>Period:</strong> {month} {year}
                  <br />
                  <strong>Amount:</strong> KES {amountPaid.toLocaleString()}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendEmail}
              disabled={isSending || !tenant.email}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SMS Dialog */}
      <AlertDialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Send Receipt via SMS
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 mt-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    <strong>SMS charges apply:</strong> Approximately KES 0.80
                    per message.
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recipient Phone</Label>
                  <div className="mt-1 p-2 bg-muted rounded border text-sm">
                    {tenant.mobile || "No phone number on record"}
                  </div>
                  {!tenant.mobile && (
                    <p className="text-xs text-destructive mt-1">
                      Please add a mobile number to this tenant's profile first.
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <strong>Message preview:</strong>
                  <br />
                  SmartRent: Receipt #{receiptNo.slice(-8)} for {tenant.name}.
                  Paid: KES {amountPaid.toLocaleString()} for {month} {year}.
                  {tenant.balanceDue > 0
                    ? ` Balance: KES ${tenant.balanceDue.toLocaleString()}.`
                    : " Fully paid."}
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-300">
                    <Info className="w-4 h-4 inline mr-1" />
                    <strong>Tip:</strong> Email is recommended for detailed
                    receipts.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendSMS}
              disabled={isSending || !tenant.mobile}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS (Charges Apply)
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
