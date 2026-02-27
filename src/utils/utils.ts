import type { Tenant, HouseSize } from "@/data/mockData";

import {
  Plus,
  Search,
  Filter,
  Phone,
  Edit2,
  Edit,
  Eye,
  Printer,
  AlertCircle,
  Calendar,
  CreditCard,
  Droplets,
  Trash2,
  Building2,
  DollarSign,
  AlertTriangle,
  Save,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  TrendingUp,
  Download,
  Home,
  Users,
  Wifi,
  WifiOff,
  MapPin,
  ArrowLeft,
  User,
  Mail,
  Settings,
  Wrench,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Loader,
  Wallet,
  Calculator,
  Info,
} from "lucide-react";

export const icons = {
  plus: Plus,
  search: Search,
  filter: Filter,
  phone: Phone,
  edit2: Edit2,
  loader: Loader,
  eye: Eye,
  printer: Printer,
  alertCircle: AlertCircle,
  calendar: Calendar,
  creditcard: CreditCard,
  droplets: Droplets,
  trash2: Trash2,
  building2: Building2,
  dollarSign: DollarSign,
  alertTriangle: AlertTriangle,
  save: Save,
  refreshCw: RefreshCw,
  clock: Clock,
  checkCircle: CheckCircle,
  fileText: FileText,
  userPlus: UserPlus,
  trendingUp: TrendingUp,
  home: Home,
  Users,
  Edit,
  Wifi,
  WifiOff,
  MapPin,
  ArrowLeft,
  User,
  Mail,
  Settings,
  Wrench,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Wallet,
  Calculator,
  Info,
};

export const updateNewTenant = (newTenant, monthlyRent) => {
  const tenant: Tenant = {
    id: Date.now().toString(),
    name: newTenant.name!,
    mobile: newTenant.mobile!,
    nextOfKinName: newTenant.nextOfKinName || "",
    nextOfKinMobile: newTenant.nextOfKinMobile || "",
    houseNumber: newTenant.houseNumber!,
    houseSize: newTenant.houseSize as HouseSize,
    area: newTenant.area || "",
    monthlyRent,
    penalties: 0,
    lastPaymentDate: null,
    duePaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    balanceDue: monthlyRent,
    status: "active",
    entryDate: new Date().toISOString().split("T")[0],
    waterBill: 0,
    garbageBill: 150,
    depositPaid: 0,
    buildingCode: newTenant.buildingCode || "001",
  };

  return tenant;
};

export const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function formatMoney(amountKES: number, currency: "KES" | "USD") {
  if (currency === "USD") {
    const rate = 0.0075; // example rate
    const usd = amountKES * rate;
    return `$${usd.toFixed(2)}`;
  }

  return `KES ${amountKES?.toLocaleString()}`;
}

// Generate years from 2025 to 2040
export const generateYears = () => {
  const years = [];
  for (let year = 2025; year <= 2040; year++) {
    years.push(year);
  }
  return years;
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const PAYMENT_METHODS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "equity", label: "Equity Bank" },
  { value: "kcb", label: "KCB Bank" },
  { value: "cooperative", label: "Cooperative Bank" },
  { value: "family_bank", label: "Family Bank" },
  { value: "cash", label: "Cash" },
];

export const isFutureMonth = (selectedYear, selectedMonth) => {
  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();

  // Assuming selectedMonth and selectedYear come from redux/select
  return (
    selectedYear > currentYear ||
    (selectedYear === currentYear &&
      MONTHS.indexOf(selectedMonth) > MONTHS.indexOf(currentMonth))
  );
};

// export const api = axios.create({
//   baseURL: "http://localhost:5000",
//   withCredentials: true, // useful if you later add cookies
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
