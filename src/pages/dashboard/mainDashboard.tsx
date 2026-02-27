// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentDate } from "@/components/CurrentDate";
import dayjs from "dayjs";
import { formatMoney, MONTHS, generateYears } from "@/utils/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAppSelector } from "@/store/hooks";
import { getIconEmoji } from "../buildingPage/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MonthlyBreakdown from "./MonthlyBreakdown";
import { ErrorState } from "@/errors/dataError";

// React Query hooks
import { useBuildingsList, useBuildingUnits } from "@/hooks/useBuildingAps";
import { useReportsApi } from "@/hooks/useReportsApi";
import { useMonthlyPaymentsByMonth } from "@/hooks/useDashboardApi";
import { useSettingsApi } from "@/hooks/useSettingsApi";

const BUILDING_GRADIENTS = [
  "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
  "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
  "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
  "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
  "from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
  "from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20",
  "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20",
];

export function Dashboard() {
  // ── Local State ──────────────────────────────────────────────────────────
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    MONTHS[dayjs().month()],
  );
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const currentMonth = MONTHS[dayjs().month()];
  const currentYear = dayjs().year();

  // ── Redux State (Settings Only) ──────────────────────────────────────────
  const currency = useAppSelector((state) => state.settingsQ.currency);
  const { buildings: data } = useSettingsApi();
  const settingsBuildings = data ?? [];

  // ── React Query: Buildings ───────────────────────────────────────────────
  const {
    data: buildings = [],
    isLoading: buildingsLoading,
    isError: buildingsError,
    error: buildingsErrorObj,
  } = useBuildingsList();

  // Get selected building name
  const selectedBuildingName = useMemo(() => {
    if (!selectedBuildingId) return undefined;
    const building = buildings.find((b) => b.id === selectedBuildingId);
    return building?.name;
  }, [selectedBuildingId, buildings]);

  // ── React Query: Monthly Payments ────────────────────────────────────────
  const {
    data: monthlyPaymentsResponse,
    isLoading: monthlyPaymentsLoading,
    isError: monthlyPaymentsError,
    error: monthlyPaymentsErrorObj,
    refetch: refetchMonthlyPayments,
  } = useMonthlyPaymentsByMonth({
    month: selectedMonth,
    year: selectedYear,
    buildingName: selectedBuildingName,
  });

  // ── React Query: Annual Summary ──────────────────────────────────────────
  const { annualSummary, annualSummaryLoading } = useReportsApi({
    year: selectedYear, // Use selectedYear instead of currentYear
    buildingName: selectedBuildingName,
  });

  // Extract data from response
  const monthlyPaymentsData = monthlyPaymentsResponse?.data || [];
  const monthlyPaymentsSummary = monthlyPaymentsResponse?.summary || {};

  // ── Computed Values ──────────────────────────────────────────────────────
  const isLoading =
    monthlyPaymentsLoading || annualSummaryLoading || buildingsLoading;

  // Calculate stats
  const stats = useMemo(() => {
    const summary = monthlyPaymentsSummary;
    const totalTenants = summary?.totalTenants || 0;

    const thisMonthCollected =
      (summary?.totalRentPaid || 0) +
      (summary?.totalWaterPaid || 0) +
      (summary?.totalGarbagePaid || 0) +
      (summary?.totalPenaltiesPaid || 0);

    const thisMonthPayments =
      monthlyPaymentsData?.filter(
        (payment) => payment.rentPaid > 0 || payment.waterPaid > 0,
      ).length || 0;

    const totalRentThisYear = annualSummary?.data?.income?.totalIncome || 0;
    const totalRentAllTime = annualSummary?.data?.allTime?.totalIncome || 0;
    const overdueAmount = summary?.totalBalanceDue || 0;
    const overdueTenants = summary?.overdueTenants || 0;

    return [
      {
        title: "Active Tenants",
        value: totalTenants.toString(),
        change: `${selectedMonth} ${selectedYear}`,
        trend: "up",
        icon: Users,
        color: "blue",
      },
      {
        title: `${selectedMonth} Collections`,
        value: formatMoney(thisMonthCollected, currency),
        change: `${thisMonthPayments} payments`,
        trend: thisMonthCollected > 0 ? "up" : "neutral",
        icon: CalendarDays,
        color: "green",
      },
      {
        title: `Collected in ${selectedYear}`,
        value: formatMoney(totalRentThisYear, currency),
        change: `${annualSummary?.data?.monthlyBreakdown?.length || 0} months`,
        trend: "up",
        icon: DollarSign,
        color: "green",
      },
      {
        title: "Total Collections",
        value: formatMoney(totalRentAllTime, currency),
        change: "All time",
        trend: "neutral",
        icon: TrendingUp,
        color: "blue",
      },
      {
        title: "Overdue Amount",
        value: formatMoney(overdueAmount, currency),
        change: `${overdueTenants} tenants`,
        trend: overdueAmount > 0 ? "down" : "neutral",
        icon: AlertTriangle,
        color: "red",
      },
    ];
  }, [
    monthlyPaymentsData,
    monthlyPaymentsSummary,
    annualSummary,
    currency,
    selectedMonth,
    selectedYear,
  ]);

  // Payment status data for pie chart
  const paymentStatusData = useMemo(() => {
    const summary = monthlyPaymentsSummary;
    return [
      {
        name: "Paid",
        value: summary?.paidTenants || 0,
        color: "hsl(134, 61%, 41%)",
      },
      {
        name: "Partial",
        value: summary?.partialTenants || 0,
        color: "hsl(45, 100%, 51%)",
      },
      {
        name: "Not Paid",
        value: summary?.notPaidTenants || 0,
        color: "hsl(354, 70%, 54%)",
      },
    ];
  }, [monthlyPaymentsSummary]);

  // Occupancy data by unit type
  const occupancyData = useMemo(() => {
    if (!buildings || buildings.length === 0) return [];

    const buildingsToAnalyze = selectedBuildingId
      ? buildings.filter((b) => b.id === selectedBuildingId)
      : buildings;

    const unitTypeCountMap = new Map<string, number>();

    buildingsToAnalyze.forEach((building) => {
      building.units?.forEach((unit) => {
        if (unit.unit_type_name) {
          const currentCount = unitTypeCountMap.get(unit.unit_type_name) || 0;
          if (unit.is_occupied) {
            unitTypeCountMap.set(unit.unit_type_name, currentCount + 1);
          }
        }
      });
    });

    return Array.from(unitTypeCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [buildings, selectedBuildingId]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    if (
      !annualSummary?.data?.monthlyBreakdown ||
      annualSummary.data.monthlyBreakdown.length === 0
    ) {
      return [];
    }

    return annualSummary.data.monthlyBreakdown.map((month: any) => ({
      month: month.month.substring(0, 3),
      collected: Number(month.income) || 0,
      transactions: Number(month.transactions) || 0,
    }));
  }, [annualSummary]);

  // Unit types distribution per building
  const unitTypesPerBuilding = useMemo(() => {
    if (!buildings || buildings.length === 0 || !settingsBuildings) return [];

    const data: any[] = [];
    const buildingsToAnalyze = selectedBuildingId
      ? buildings.filter((b) => b.id === selectedBuildingId)
      : buildings;

    buildingsToAnalyze.forEach((building) => {
      const settingsBuilding = settingsBuildings.find(
        (sb) => sb.id === building.id,
      );
      const configuredUnitTypes = settingsBuilding?.unitTypes || [];

      const unitTypeNameMap = new Map<string, string>();
      configuredUnitTypes.forEach((config) => {
        if (config.unit_type_id) {
          unitTypeNameMap.set(config.unit_type_id, config.unit_type_name);
        }
      });

      const unitCounts: { [key: string]: number } = {};
      building.units?.forEach((unit) => {
        const typeName =
          unit.unit_type_name ||
          unitTypeNameMap.get(unit.unit_type_id) ||
          "Other";
        unitCounts[typeName] = (unitCounts[typeName] || 0) + 1;
      });

      const buildingData: any = { building: building.name };
      Object.entries(unitCounts).forEach(([typeName, count]) => {
        buildingData[typeName] = count;
      });

      data.push(buildingData);
    });

    return data;
  }, [buildings, settingsBuildings, selectedBuildingId]);

  const allUnitTypeNames = useMemo(() => {
    const names = new Set<string>();
    unitTypesPerBuilding.forEach((building) => {
      Object.keys(building).forEach((key) => {
        if (key !== "building") names.add(key);
      });
    });
    return Array.from(names).sort();
  }, [unitTypesPerBuilding]);

  const UNIT_TYPE_COLORS_MAP: { [key: string]: string } = {
    Bedsitter: "#3b82f6",
    "Single Room": "#10b981",
    "1 BR": "#f59e0b",
    "2 BR": "#8b5cf6",
    "3 BR": "#ec4899",
    Other: "#6b7280",
  };

  const displayBuildingName = useMemo(() => {
    if (!selectedBuildingId) return "All Buildings";
    const building = buildings.find((b) => b.id === selectedBuildingId);
    return building?.name || "All Buildings";
  }, [selectedBuildingId, buildings]);

  // Generate available years for the dropdown
  const availableYears = useMemo(() => generateYears(), []);

  // ── Error Handling ───────────────────────────────────────────────────────
  if (buildingsError) {
    return (
      <ErrorState
        error={buildingsErrorObj?.message || "Failed to load buildings"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (monthlyPaymentsError) {
    return (
      <ErrorState
        error={
          monthlyPaymentsErrorObj?.message || "Failed to load monthly payments"
        }
        onRetry={refetchMonthlyPayments}
      />
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <CurrentDate />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Viewing:{" "}
          <span className="font-medium text-primary">
            {displayBuildingName}
          </span>
        </p>
      </div>

      {/* Month/Year Selector */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5" />
            Select Month & Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-sm font-medium mb-2 block">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <Label className="text-sm font-medium mb-2 block">Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Selector */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Select Property
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="relative">
            <div
              className={`
                flex overflow-x-auto gap-3 pb-3 snap-x snap-mandatory
                scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent
                md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6
                md:overflow-x-hidden md:snap-none
              `}
            >
              <button
                onClick={() => setSelectedBuildingId("")}
                className={`
                  flex-shrink-0 w-56 md:w-auto
                  flex flex-col items-center justify-center p-4 rounded-xl border
                  transition-all hover:shadow-md snap-start
                  ${
                    !selectedBuildingId
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 bg-card"
                  }
                `}
              >
                <div className="text-3xl mb-2">🏢</div>
                <span className="font-semibold text-sm sm:text-base">
                  All Properties
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Overview
                </span>
              </button>

              {buildings.map((building, idx) => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuildingId(building.id)}
                  className={`
                    flex-shrink-0 w-56 md:w-auto
                    flex flex-col items-center justify-center p-4 rounded-xl border
                    transition-all hover:shadow-md snap-start
                    ${
                      selectedBuildingId === building.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 bg-card"
                    }
                    bg-gradient-to-br ${BUILDING_GRADIENTS[idx % BUILDING_GRADIENTS.length]}
                  `}
                >
                  <div className="text-3xl mb-2">
                    {getIconEmoji(building.icon) || "🏠"}
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-center line-clamp-1">
                    {building.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent md:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent md:hidden" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="relative">
        <div
          className={`
            flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory
            scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent
            sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5
            sm:overflow-x-hidden sm:snap-none
          `}
        >
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={`
                flex-shrink-0 w-64 sm:w-auto
                shadow-sm border transition-all hover:shadow-md
                min-w-[240px] snap-start sm:min-w-0 rounded-xl
              `}
            >
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-5 w-14 rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-32 rounded" />
                      <Skeleton className="h-4 w-40 rounded" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          stat.color === "blue"
                            ? "bg-blue-100"
                            : stat.color === "green"
                              ? "bg-green-100"
                              : stat.color === "red"
                                ? "bg-red-100"
                                : "bg-gray-100"
                        }`}
                      >
                        <stat.icon
                          className={`w-5 h-5 ${
                            stat.color === "blue"
                              ? "text-blue-600"
                              : stat.color === "green"
                                ? "text-green-600"
                                : stat.color === "red"
                                  ? "text-red-600"
                                  : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div
                        className={`flex items-center text-xs font-medium ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stat.trend === "up" && (
                          <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                        )}
                        {stat.trend === "down" && (
                          <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.title}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent sm:hidden" />
      </div>

      {!isLoading && monthlyPaymentsData && monthlyPaymentsData.length > 0 && (
        <>
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Income Trend */}
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>Monthly Income Trend - {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  {monthlyTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis
                          stroke="#6b7280"
                          tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value: number) => [
                            formatMoney(value, currency),
                            "Collected",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="collected"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", r: 4 }}
                          name="Collected"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No monthly data available for {selectedYear}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Pie */}
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>
                  Payment Status - {selectedMonth} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] flex items-center justify-center">
                  {paymentStatusData.some((d) => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) =>
                            value > 0 ? `${name}: ${value}` : ""
                          }
                        >
                          {paymentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-500">
                      No payment data available for {selectedMonth}{" "}
                      {selectedYear}
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-8 mt-6 flex-wrap">
                  {paymentStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Payments Breakdown */}
          <MonthlyBreakdown
            monthlyPaymentsData={monthlyPaymentsData}
            summary={monthlyPaymentsSummary}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            currency={currency}
          />

          {/* Occupancy by Unit Type */}
          {occupancyData.length > 0 && (
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>Occupancy by Unit Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {occupancyData.map((item) => (
                    <div
                      key={item.name}
                      className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-center"
                    >
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                        {item.count}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unit Types Distribution per Building */}
          {unitTypesPerBuilding.length > 0 && (
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>Unit Types Distribution per Building</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={unitTypesPerBuilding}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="building"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        stroke="#6b7280"
                        interval={0}
                        fontSize={12}
                      />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      {allUnitTypeNames.map((typeName, index) => (
                        <Bar
                          key={typeName}
                          dataKey={typeName}
                          name={typeName}
                          fill={
                            UNIT_TYPE_COLORS_MAP[typeName] ||
                            `hsl(${(index * 360) / allUnitTypeNames.length}, 70%, 50%)`
                          }
                          radius={[8, 8, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!isLoading &&
        (!monthlyPaymentsData || monthlyPaymentsData.length === 0) && (
          <Card className="shadow-sm border">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-6 opacity-40" />
                <p className="text-xl font-medium mb-3">
                  No tenant data available yet
                </p>
                <p className="text-sm max-w-md mx-auto">
                  {selectedBuildingId
                    ? `No tenants found in ${displayBuildingName} for ${selectedMonth} ${selectedYear}. Try selecting a different month, year, or building.`
                    : `No payment records found for ${selectedMonth} ${selectedYear}. Start by adding tenants or select a different period.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
