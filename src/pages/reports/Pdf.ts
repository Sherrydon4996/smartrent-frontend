// utils/pdfGenerator.ts - FIXED VERSION
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatMoney } from "@/utils/utils";

interface PDFConfig {
  title: string;
  subtitle?: string;
  filename: string;
  orientation?: "portrait" | "landscape";
}

interface TableColumn {
  header: string;
  dataKey: string;
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 15;
  private currentY = 20;

  constructor(orientation: "portrait" | "landscape" = "portrait") {
    this.doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  addHeader(title: string, subtitle?: string) {
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.pageWidth / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 10;

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(subtitle, this.pageWidth / 2, this.currentY, {
        align: "center",
      });
      this.currentY += 8;
    }

    this.doc.setFontSize(10);
    this.doc.setTextColor(100);
    const dateStr = `Generated on: ${new Date().toLocaleString()}`;
    this.doc.text(dateStr, this.pageWidth / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 10;

    this.doc.setDrawColor(200);
    this.doc.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY,
    );
    this.currentY += 8;

    this.doc.setTextColor(0);
  }

  addSummary(summaryData: { label: string; value: string | number }[]) {
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Summary", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    const columnWidth = (this.pageWidth - 2 * this.margin) / 2;

    summaryData.forEach((item, index) => {
      const xPos =
        this.margin + (index % 2) * columnWidth + (index % 2 === 1 ? 10 : 0);

      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${item.label}:`, xPos, this.currentY);

      this.doc.setFont("helvetica", "normal");
      const valueStr = String(item.value);
      this.doc.text(
        valueStr,
        xPos + this.doc.getTextWidth(`${item.label}: `),
        this.currentY,
      );

      if (index % 2 === 1) {
        this.currentY += 7;
      }
    });

    if (summaryData.length % 2 === 1) {
      this.currentY += 7;
    }

    this.currentY += 5;
  }

  addTable(
    columns: TableColumn[],
    data: any[],
    title?: string,
    showFooter = true,
  ) {
    if (title) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(title, this.margin, this.currentY);
      this.currentY += 8;
    }

    autoTable(this.doc, {
      startY: this.currentY,
      head: [columns.map((col) => col.header)],
      body: data.map((row) => columns.map((col) => row[col.dataKey] || "-")),
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        if (showFooter) {
          const pageCount = this.doc.getNumberOfPages();
          this.doc.setFontSize(8);
          this.doc.setTextColor(100);
          this.doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            this.pageWidth / 2,
            this.pageHeight - 10,
            { align: "center" },
          );
        }
      },
    });

    // @ts-ignore
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  addSection(title: string, content: string[]) {
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 7;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    content.forEach((line) => {
      const lines = this.doc.splitTextToSize(
        line,
        this.pageWidth - 2 * this.margin,
      );
      lines.forEach((textLine: string) => {
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage();
          this.currentY = 20;
        }
        this.doc.text(textLine, this.margin, this.currentY);
        this.currentY += 6;
      });
    });

    this.currentY += 5;
  }

  addPageBreak() {
    this.doc.addPage();
    this.currentY = 20;
  }

  download(filename: string) {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return this.doc.output("blob");
  }

  getDataUrl(): string {
    return this.doc.output("dataurlstring");
  }
}

// Helper to safely format numbers
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * FIXED: Tenant Balance Report
 * - Uses tenant_credit (persistent global credit) for advance balance
 * - Calculates outstanding from current month only
 */
export const generateTenantBalanceReport = (
  data: any[],
  summary: any,
  filters: any,
  currency: "KES" | "USD",
) => {
  const pdf = new PDFGenerator("landscape");

  pdf.addHeader(
    "Tenant Balance Report",
    `${filters.buildingName || "All Buildings"} - ${filters.month} ${filters.year}`,
  );

  pdf.addSummary([
    { label: "Total Tenants", value: summary.totalTenants || 0 },
    {
      label: "Expected Rent",
      value: formatMoney(safeNumber(summary.totalExpectedRent), currency),
    },
    {
      label: "Total Collected",
      value: formatMoney(safeNumber(summary.totalCollected), currency),
    },
    {
      label: "Total Outstanding",
      value: formatMoney(safeNumber(summary.totalOutstanding), currency),
    },
    {
      label: "Total Credit Balance", // FIXED: Use totalCredit from summary
      value: formatMoney(safeNumber(summary.totalCredit), currency),
    },
    {
      label: "Tenants Not Paid",
      value: summary.tenantsNotPaid || 0,
    },
    {
      label: "Collection Rate",
      value:
        summary.totalExpectedRent > 0
          ? `${((safeNumber(summary.totalCollected) / safeNumber(summary.totalExpectedRent)) * 100).toFixed(1)}%`
          : "0%",
    },
  ]);

  const columns = [
    { header: "Name", dataKey: "name" },
    { header: "House", dataKey: "houseNumber" },
    { header: "Building", dataKey: "buildingName" },
    { header: "Mobile", dataKey: "mobile" },
    { header: "Expected", dataKey: "totalDue" },
    { header: "Paid", dataKey: "totalPaid" },
    { header: "Outstanding", dataKey: "outstandingBalance" },
    { header: "Credit Balance", dataKey: "creditBalance" }, // FIXED: Changed label
    { header: "Status", dataKey: "status" },
  ];

  const tableData = data.map((tenant) => ({
    ...tenant,
    totalDue: formatMoney(safeNumber(tenant.totalDue), currency),
    // FIXED: Use totalPaidThisMonth if available, fallback to totalPaid
    totalPaid: formatMoney(
      safeNumber(tenant.totalPaidThisMonth || tenant.totalPaid),
      currency,
    ),
    // FIXED: Use currentMonthOutstanding if available, fallback to outstandingBalance
    outstandingBalance: formatMoney(
      safeNumber(tenant.currentMonthOutstanding || tenant.outstandingBalance),
      currency,
    ),
    // FIXED: Use tenant_credit (global credit) or creditBalance
    creditBalance: formatMoney(
      safeNumber(tenant.tenant_credit || tenant.creditBalance),
      currency,
    ),
  }));

  pdf.addTable(columns, tableData, "Tenant Details");

  pdf.download(`tenant-balance-report-${Date.now()}.pdf`);
};

/**
 * FIXED: Payment History Report
 * - Summary now reflects correct totals (excluding settlements if backend excludes them)
 */
export const generatePaymentHistoryReport = (
  data: any[],
  summary: any,
  filters: any,
  currency: "KES" | "USD",
) => {
  const pdf = new PDFGenerator("landscape");

  pdf.addHeader(
    "Payment History Report",
    filters.buildingName || "All Buildings",
  );

  pdf.addSummary([
    { label: "Total Transactions", value: summary.totalTransactions || 0 },
    {
      label: "Total Amount",
      value: formatMoney(safeNumber(summary.totalAmount), currency),
    },
    {
      label: "Rent Collected",
      value: formatMoney(safeNumber(summary.totalRent), currency),
    },
    {
      label: "Water Collected",
      value: formatMoney(safeNumber(summary.totalWater), currency),
    },
    {
      label: "Garbage Collected",
      value: formatMoney(safeNumber(summary.totalGarbage), currency),
    },
    {
      label: "Penalties",
      value: formatMoney(safeNumber(summary.totalPenalties), currency),
    },
  ]);

  const columns = [
    { header: "Date", dataKey: "date" },
    { header: "Tenant", dataKey: "tenantName" },
    { header: "House", dataKey: "houseNumber" },
    { header: "Building", dataKey: "buildingName" },
    { header: "Rent", dataKey: "rent" },
    { header: "Water", dataKey: "water" },
    { header: "Garbage", dataKey: "garbage" },
    { header: "Penalty", dataKey: "penalty" },
    { header: "Total", dataKey: "totalAmount" },
    { header: "Method", dataKey: "method" },
  ];

  const tableData = data.map((payment) => ({
    ...payment,
    rent: formatMoney(safeNumber(payment.rent), currency),
    water: formatMoney(safeNumber(payment.water), currency),
    garbage: formatMoney(safeNumber(payment.garbage), currency),
    penalty: formatMoney(safeNumber(payment.penalty), currency),
    totalAmount: formatMoney(safeNumber(payment.totalAmount), currency),
  }));

  pdf.addTable(columns, tableData, "Payment Transactions");

  pdf.download(`payment-history-report-${Date.now()}.pdf`);
};

/**
 * FIXED: Monthly Income Report
 * - Uses correct field names from backend
 * - Properly displays credit vs outstanding
 */
export const generateMonthlyIncomeReport = (
  data: any[],
  summary: any,
  filters: any,
  currency: "KES" | "USD",
) => {
  const pdf = new PDFGenerator("landscape");

  pdf.addHeader(
    "Monthly Income Report",
    `${filters.month} ${filters.year} - ${filters.buildingName || "All Buildings"}`,
  );

  pdf.addSummary([
    { label: "Total Tenants", value: summary.totalTenants || 0 },
    {
      label: "Total Expected",
      value: formatMoney(safeNumber(summary.totalExpected), currency),
    },
    {
      label: "Total Collected",
      value: formatMoney(safeNumber(summary.totalCollected), currency),
    },
    {
      label: "Total Outstanding",
      value: formatMoney(safeNumber(summary.totalOutstanding), currency),
    },
    {
      // FIXED: This is current month advance (overpayment), not global credit
      label: "This Month Advance",
      value: formatMoney(safeNumber(summary.totalAdvance), currency),
    },
    { label: "Collection Rate", value: `${summary.collectionRate || 0}%` },
  ]);

  const columns = [
    { header: "Tenant", dataKey: "tenantName" },
    { header: "House", dataKey: "houseNumber" },
    { header: "Building", dataKey: "buildingName" },
    { header: "Mobile", dataKey: "mobile" },
    { header: "Expected", dataKey: "totalExpected" },
    { header: "Collected", dataKey: "totalCollected" },
    { header: "Outstanding", dataKey: "outstanding" },
    { header: "Advance", dataKey: "advance" }, // Current month advance
  ];

  const tableData = data.map((item) => ({
    ...item,
    totalExpected: formatMoney(safeNumber(item.totalExpected), currency),
    totalCollected: formatMoney(safeNumber(item.totalCollected), currency),
    outstanding: formatMoney(safeNumber(item.outstanding), currency),
    advance: formatMoney(safeNumber(item.advance), currency), // Current month advance
  }));

  pdf.addTable(columns, tableData, "Individual Tenant Breakdown");

  pdf.download(`monthly-income-report-${filters.month}-${filters.year}.pdf`);
};

/**
 * FIXED: Outstanding Balances Report
 * - Uses tenant_credit for global credit balance
 * - totalAdvance in this report is actually calculated historical advance
 */
export const generateOutstandingBalancesReport = (
  data: any[],
  summary: any,
  filters: any,
  currency: "KES" | "USD",
) => {
  const pdf = new PDFGenerator("landscape");

  pdf.addHeader(
    "Outstanding Balances Report",
    filters.buildingName || "All Buildings",
  );

  pdf.addSummary([
    { label: "Tenants Owing", value: summary.tenantsWithDept || 0 },
    {
      label: "Total Outstanding",
      value: formatMoney(safeNumber(summary.totalOutstanding), currency),
    },
    {
      // FIXED: This summary.totalAdvance is historical calculated, not from tenant_credit
      label: "Historical Advance",
      value: formatMoney(safeNumber(summary.totalCredit), currency),
    },
    {
      label: "Total Debt",
      value: formatMoney(safeNumber(summary.totalOutstanding), currency),
    },
  ]);

  const columns = [
    { header: "Name", dataKey: "name" },
    { header: "House", dataKey: "houseNumber" },
    { header: "Building", dataKey: "buildingName" },
    { header: "Mobile", dataKey: "mobile" },
    { header: "Monthly Rent", dataKey: "monthlyRent" },
    { header: "Outstanding", dataKey: "totalOutstanding" },
    { header: "Advance", dataKey: "totalAdvance" }, // Historical advance
    { header: "Months Owing", dataKey: "monthsWithBalance" },
    { header: "Last Payment", dataKey: "lastPaymentDate" },
  ];

  const tableData = data.map((tenant) => ({
    ...tenant,
    monthlyRent: formatMoney(safeNumber(tenant.monthlyRent), currency),
    totalOutstanding: formatMoney(
      safeNumber(tenant.outstandingBalance),
      currency,
    ),
    totalAdvance: formatMoney(safeNumber(tenant.tenant_credit), currency), // Historical
    monthsWithBalance: tenant.outstandingBalance > 0 ? 1 : 0,
    lastPaymentDate: tenant.lastUpdated
      ? new Date(tenant.lastUpdated).toLocaleDateString()
      : "Never",
  }));

  pdf.addTable(columns, tableData, "Tenants with Outstanding Balances");

  pdf.download(`outstanding-balances-report-${Date.now()}.pdf`);
};

/**
 * FIXED: Annual Summary Report
 * - Now shows correct income (without credit settlements)
 */
export const generateAnnualSummaryReport = (
  data: any,
  filters: any,
  currency: "KES" | "USD",
) => {
  const pdf = new PDFGenerator();

  pdf.addHeader(
    "Annual Financial Summary",
    `Year ${filters.year} - ${filters.buildingName || "All Buildings"}`,
  );

  pdf.addSummary([
    {
      label: "Total Income",
      value: formatMoney(safeNumber(data.income?.totalIncome), currency),
    },
    {
      label: "Rent Income",
      value: formatMoney(safeNumber(data.income?.rentIncome), currency),
    },
    {
      label: "Water Income",
      value: formatMoney(safeNumber(data.income?.waterIncome), currency),
    },
    {
      label: "Garbage Income",
      value: formatMoney(safeNumber(data.income?.garbageIncome), currency),
    },
    {
      label: "Penalty Income",
      value: formatMoney(safeNumber(data.income?.penaltyIncome), currency),
    },
    {
      label: "Deposit Income",
      value: formatMoney(safeNumber(data.income?.depositIncome), currency),
    },
    {
      label: "Total Transactions",
      value: data.income?.transactionCount || 0,
    },
    { label: "Active Tenants", value: data.tenants?.activeTenants || 0 },
    {
      label: "Avg Monthly Income",
      value: formatMoney(safeNumber(data.averageMonthlyIncome), currency),
    },
  ]);

  const columns = [
    { header: "Month", dataKey: "month" },
    { header: "Income", dataKey: "income" },
    { header: "Transactions", dataKey: "transactions" },
  ];

  const tableData = (data.monthlyBreakdown || []).map((month: any) => ({
    month: month.month,
    income: formatMoney(safeNumber(month.income), currency),
    transactions: month.transactions || 0,
  }));

  pdf.addTable(columns, tableData, "Monthly Breakdown");

  pdf.download(`annual-summary-report-${filters.year}.pdf`);
};
