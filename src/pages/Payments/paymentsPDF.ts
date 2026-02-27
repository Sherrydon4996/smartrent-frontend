import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (
  filteredPayments,
  selectedMonthLabel,
  selectedYear,
  currency,
  formatMoney,
  formatDate,
  getPaymentMethodLabel,
) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text(`Payment Summary - ${selectedMonthLabel} ${selectedYear}`, 14, 20);

  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-KE")}`, 14, 28);

  const tableColumn = [
    "Tenant",
    "House",
    "Building",
    "Rent",
    "Water",
    "Garbage",
    "Deposit",
    "Penalty",
    "Total",
    "Method",
    "Last Updated",
  ];

  const tableRows = filteredPayments.map((payment) => [
    payment.name + (payment.mobile ? `\n${payment.mobile}` : ""),
    payment.houseNumber,
    payment.buildingName || "",
    payment.rentPaid > 0 ? formatMoney(payment.rentPaid, currency) : "-",
    payment.waterPaid > 0 ? formatMoney(payment.waterPaid, currency) : "-",
    payment.garbagePaid > 0 ? formatMoney(payment.garbagePaid, currency) : "-",
    payment.depositPaid > 0 ? formatMoney(payment.depositPaid, currency) : "-",
    payment.penaltyPaid > 0 ? formatMoney(payment.penaltyPaid, currency) : "-",
    formatMoney(payment.totalPaid, currency),
    getPaymentMethodLabel(payment.transactions),
    formatDate(payment.lastUpdated),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 36,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [70, 70, 80], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      8: { fontStyle: "bold" },
    },
    didParseCell(data) {
      // Optional: make total column bold
      if (data.column.index === 8) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save(`Payments_${selectedMonthLabel}_${selectedYear}.pdf`);
};

export interface Transaction {
  id: string;
  tenantId: string;
  TotalAmount: number;
  rent: number;
  water: number;
  garbage: number;
  penalty: number;
  deposit: number;
  method: string;
  reference: string;
  date: string;
  timestamp: string;
  month: string;
  year: number;
  notes?: string;
}

export interface GroupedPayment {
  tenantId: string;
  name: string;
  houseNumber: string;
  buildingName: string;
  mobile: string;
  totalPaid: number;
  rentPaid: number;
  waterPaid: number;
  garbagePaid: number;
  depositPaid: number;
  penaltyPaid: number;
  transactions: Transaction[];
  lastUpdated?: string;
}
