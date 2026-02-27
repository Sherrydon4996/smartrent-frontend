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

  // Email/SMS dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #007BFF; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #007BFF; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0 0; }
            .receipt-no { text-align: right; color: #666; font-size: 12px; margin-bottom: 20px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { color: #666; }
            .value { font-weight: bold; }
            .breakdown { background: #f8f9fa; padding: 15px; margin-top: 20px; border-radius: 8px; }
            .breakdown .row { border: none; }
            .total { background: #28A745; color: white; padding: 15px; margin-top: 20px; border-radius: 8px; }
            .total .row { border: none; font-size: 18px; color: white; }
            .status { text-align: center; margin-top: 30px; padding: 15px; background: #28A745; color: white; border-radius: 8px; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send email");
      }

      toast({
        title: "Email Sent Successfully",
        description: `Receipt sent to ${tenant.email}`,
        variant: "success",
      });

      setShowEmailDialog(false);
    } catch (error: any) {
      console.error("Email send error:", error);
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

    // Basic format check (you can keep or remove based on your needs)
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

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send SMS");
      }

      const data = response.data;

      toast({
        title: "SMS Sent Successfully",
        description: `Receipt notification sent to ${tenant.mobile}. ${data.cost ? `Cost: KES ${data.cost}` : ""}`,
        variant: "success",
      });

      setShowSMSDialog(false);
    } catch (error: any) {
      console.error("SMS send error:", error);
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

  const receiptNo = `RCP-${year}${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${tenant.id.slice(0, 8).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate totals
  const monthlyRent = tenant.monthlyRent || 0;
  const waterBill = tenant.waterBill || 0;
  const garbageBill = tenant.garbageBill || 0;
  const penalties = tenant.penalties || 0;
  const totalDue = monthlyRent + waterBill + garbageBill + penalties;
  const amountPaid = totalDue - (tenant.balanceDue || 0);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Receipt</span>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  size="sm"
                  variant="outline"
                  title="Print receipt"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  onClick={() => setShowEmailDialog(true)}
                  size="sm"
                  variant="outline"
                  title="Send via email (free)"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={() => setShowSMSDialog(true)}
                  size="sm"
                  variant="outline"
                  title="Send via SMS (charges apply)"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div ref={receiptRef} className="bg-white text-black p-6 rounded-lg">
            <div className="header">
              <h1>SmartRent Manager</h1>
              <p>Rental Payment Receipt</p>
            </div>

            <div className="receipt-no">
              Receipt No: {receiptNo}
              <br />
              Date: {currentDate}
            </div>

            <div className="details">
              <div className="row">
                <span className="label">Tenant Name:</span>
                <span className="value">{tenant.name}</span>
              </div>
              <div className="row">
                <span className="label">Phone Number:</span>
                <span className="value">{tenant.mobile || "N/A"}</span>
              </div>
              <div className="row">
                <span className="label">Email:</span>
                <span className="value">{tenant.email || "N/A"}</span>
              </div>
              <div className="row">
                <span className="label">House Number:</span>
                <span className="value">{tenant.houseNumber}</span>
              </div>
              <div className="row">
                <span className="label">Building:</span>
                <span className="value">{tenant.buildingName}</span>
              </div>
              <div className="row">
                <span className="label">House Type:</span>
                <span className="value">{tenant.houseSize}</span>
              </div>
              <div className="row">
                <span className="label">Area:</span>
                <span className="value">{tenant.area || "N/A"}</span>
              </div>
              <div className="row">
                <span className="label">Payment Period:</span>
                <span className="value">
                  {month} {year}
                </span>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="breakdown">
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "16px",
                  color: "#333",
                }}
              >
                Payment Breakdown
              </h3>
              <div className="row">
                <span className="label">Monthly Rent:</span>
                <span className="value">
                  KES {monthlyRent.toLocaleString()}
                </span>
              </div>
              <div className="row">
                <span className="label">Water Bill:</span>
                <span className="value">KES {waterBill.toLocaleString()}</span>
              </div>
              <div className="row">
                <span className="label">Garbage Fee:</span>
                <span className="value">
                  KES {garbageBill.toLocaleString()}
                </span>
              </div>
              {penalties > 0 && (
                <div className="row" style={{ color: "#DC3545" }}>
                  <span className="label">Penalties:</span>
                  <span className="value">
                    KES {penalties.toLocaleString()}
                  </span>
                </div>
              )}
              <div
                className="row"
                style={{
                  borderTop: "2px solid #ddd",
                  marginTop: "10px",
                  paddingTop: "15px",
                  fontWeight: "bold",
                }}
              >
                <span className="label">Total Due:</span>
                <span className="value">KES {totalDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Paid */}
            <div className="total">
              <div className="row">
                <span className="label">Amount Paid:</span>
                <span className="value" style={{ fontSize: "24px" }}>
                  KES {amountPaid.toLocaleString()}
                </span>
              </div>
              {tenant.balanceDue > 0 && (
                <div
                  className="row"
                  style={{ fontSize: "16px", color: "#FFD700" }}
                >
                  <span className="label">Balance Remaining:</span>
                  <span className="value">
                    KES {tenant.balanceDue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {tenant.balanceDue === 0 ? (
              <div className="status" style={{ background: "#28A745" }}>
                ✓ FULLY PAID
              </div>
            ) : (
              <div className="status" style={{ background: "#FFA500" }}>
                ⚠ PARTIAL PAYMENT - Balance: KES{" "}
                {tenant.balanceDue.toLocaleString()}
              </div>
            )}

            <div className="footer">
              <p>Thank you for your payment!</p>
              <p>SmartRent Manager - Professional Rental Management</p>
              <p style={{ marginTop: "10px", fontSize: "10px" }}>
                This is a computer-generated receipt and does not require a
                signature.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Send Receipt via Email
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <Info className="w-4 h-4 inline mr-1" />
                    Email delivery is <strong>free</strong> and instant.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Recipient Email</Label>
                  <div className="mt-1 p-2 bg-muted rounded border text-sm">
                    {tenant.email || "No email address on record"}
                  </div>
                  {!tenant.email && (
                    <p className="text-xs text-destructive mt-1">
                      Please add an email to this tenant's profile first.
                    </p>
                  )}
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Receipt for:</strong> {tenant.name}
                    <br />
                    <strong>Period:</strong> {month} {year}
                    <br />
                    <strong>Amount:</strong> KES {amountPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Send Receipt via SMS
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
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

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Message preview:</strong>
                    <br />
                    SmartRent: Receipt #{receiptNo.slice(-8)} for {tenant.name}.
                    Paid: KES {amountPaid.toLocaleString()} for {month} {year}.
                    {tenant.balanceDue > 0
                      ? ` Balance: KES ${tenant.balanceDue.toLocaleString()}.`
                      : " Fully paid."}
                  </p>
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
          <AlertDialogFooter>
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
