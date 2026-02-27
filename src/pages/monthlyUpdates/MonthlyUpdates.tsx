// src/pages/MonthlyUpdates.tsx
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrentDate } from "@/components/CurrentDate";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setEditingRecord } from "@/slices/tenantPaymentSlice";
import { formatMoney, generateYears, MONTHS } from "@/utils/utils";
import { icons } from "@/utils/utils";
import dayjs from "dayjs";
import { PaymentUpdateModal } from "@/components/PaymentUpdateModal";
import { LoadingDataState } from "@/loaders/dataLoader";
import { ErrorState } from "@/errors/dataError";
import { getIconEmoji } from "../buildingPage/utils";
import { useMonthlyPayments } from "@/hooks/useTenantPaymentApi";
import type { TenantMonthlyRecord } from "./types";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { BUILDING_STYLES } from "./uitils";
import { Button } from "@/components/ui/button";

const getBuildingCardStyle = (buildingCode: string) => {
  return (
    BUILDING_STYLES[buildingCode as keyof typeof BUILDING_STYLES]?.card ||
    "bg-card border-border"
  );
};

const getBuildingTextColor = (buildingCode: string) => {
  return (
    BUILDING_STYLES[buildingCode as keyof typeof BUILDING_STYLES]?.text ||
    "text-primary"
  );
};

export function MonthlyUpdates() {
  const dispatch = useAppDispatch();

  const editingRecord = useAppSelector(
    (state) => state.tenantPayment?.editingRecord,
  );
  const { buildings: buildingUpdates, buildingsLoading } = useSettingsApi();

  const buildings = buildingUpdates ?? [];

  const currency = useAppSelector((state) => state.settingsQ.currency);

  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");

  const currentDate = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS[currentDate.month()],
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.year());

  const {
    data: monthlyRecords = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMonthlyPayments({
    month: selectedMonth,
    year: selectedYear,
  });
  console.log(monthlyRecords);

  const activeRecords = useMemo(
    () => monthlyRecords.filter((record) => record.status === "active"),
    [monthlyRecords],
  );

  const getBuildingInfo = useCallback(
    (buildingIdentifier: string) => {
      return buildings.find(
        (b) => b.id === buildingIdentifier || b.name === buildingIdentifier,
      );
    },
    [buildings],
  );

  const filteredRecords = useMemo(() => {
    return activeRecords.filter((record) => {
      const matchesSearch =
        record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.houseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.mobile?.toString().includes(searchTerm);

      const matchesBuilding =
        buildingFilter === "all" ||
        record.buildingName === buildingFilter ||
        getBuildingInfo(record.buildingName || "")?.id === buildingFilter;

      return matchesSearch && matchesBuilding;
    });
  }, [activeRecords, searchTerm, buildingFilter, getBuildingInfo]);

  /**
   * getPaymentStatus — uses values directly from the record returned by
   * the controller (garbageBill and penalties are now correct after the
   * controller fix).
   */
  const getPaymentStatus = (record: TenantMonthlyRecord) => {
    const totalDue =
      (record.monthlyRent || 0) +
      (record.waterBill || 0) +
      (record.garbageBill || 0) + // ✅ per-tenant value from controller
      (record.penalties || 0); // ✅ actual penalty owed from monthly_payments

    const totalAppliedThisMonth =
      (record.effectiveRentPaid || 0) +
      (record.effectiveWaterPaid || 0) +
      (record.effectiveGarbagePaid || 0) +
      (record.effectivePenaltiesPaid || 0);

    const isPaidFull = totalAppliedThisMonth >= totalDue;
    const isPartialPaid = totalAppliedThisMonth > 0 && !isPaidFull;
    const isNotPaid = totalAppliedThisMonth === 0;

    const advanceThisMonth = record.advanceBalance || 0;

    return {
      isPaidFull,
      isPartialPaid,
      isNotPaid,
      totalDue,
      totalAppliedThisMonth,
      advanceThisMonth,
      balanceDue:
        record.balanceDue || Math.max(0, totalDue - totalAppliedThisMonth),
    };
  };

  const summaryStats = useMemo(() => {
    let fullyPaid = 0;
    let partialPaid = 0;
    let notPaid = 0;

    filteredRecords.forEach((record) => {
      const { isPaidFull, isPartialPaid, isNotPaid } = getPaymentStatus(record);
      if (isPaidFull) fullyPaid++;
      else if (isPartialPaid) partialPaid++;
      else if (isNotPaid) notPaid++;
    });

    return { total: filteredRecords.length, fullyPaid, partialPaid, notPaid };
  }, [filteredRecords]);

  const handleEditClick = (record: TenantMonthlyRecord) => {
    dispatch(setEditingRecord(record));
  };

  const handleRetry = () => {
    refetch();
  };

  /**
   * editingTenant — passed to PaymentUpdateModal.
   *
   * IMPORTANT: garbageBill and penalties come from editingRecord (the live
   * monthly record) so PaymentUpdateModal.calculateBalances() gets the right
   * totalDue.  Previously, penalties was never passed here so the modal
   * always treated penaltiesPaid as advance.
   */
  const editingTenant = editingRecord
    ? {
        id: editingRecord.tenantId,
        name: editingRecord.name || "",
        houseNumber: editingRecord.houseNumber || "",
        mobile: editingRecord.mobile || "",
        buildingName: editingRecord.buildingName || "",
        monthlyRent: editingRecord.monthlyRent || 0,
        waterBill: editingRecord.waterBill || 0,
        // ✅ FIX: use per-tenant garbageBill from record (not hardcoded)
        garbageBill: editingRecord.garbageBill || 0,
        status: "active" as const,
        nextOfKinName: "",
        nextOfKinMobile: "",
        houseSize: "",
        area: "",
        entryDate: "",
        depositRequired: 0,
      }
    : null;

  if (buildingsLoading || isLoading)
    return <LoadingDataState title="loading..." text="fetching buildings" />;

  if (isError) {
    return (
      <ErrorState
        error={error?.message || "Failed to load monthly payments"}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentDate />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Monthly Updates
          </h1>
          <p className="text-muted-foreground mt-1">
            Record and track tenant payments for each month
          </p>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <icons.calendar className="w-5 h-5" />
            Filter Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-4">
              <div className="flex-1 min-w-[150px]">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Month
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="min-w-[120px]">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Year
                </Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYears().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Search Tenant
              </Label>
              <div className="relative">
                <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, house number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="min-w-[180px]">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Building
              </Label>
              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger>
                  <icons.building2 className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {getIconEmoji(building.icon)} {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <icons.Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Tenants</p>
                <p className="text-xl font-bold text-foreground">
                  {summaryStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <icons.checkCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fully Paid</p>
                <p className="text-xl font-bold text-green-600">
                  {summaryStats.fullyPaid}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <icons.clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Partial Paid</p>
                <p className="text-xl font-bold text-yellow-600">
                  {summaryStats.partialPaid}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <icons.alertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Not Paid</p>
                <p className="text-xl font-bold text-red-600">
                  {summaryStats.notPaid}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tenant Cards ─────────────────────────────────────────────────── */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <icons.refreshCw className="w-5 h-5" />
            Tenants — {selectedMonth} {selectedYear}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            title="Refresh tenant list"
          >
            <icons.refreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRecords.map((record) => {
              const building = getBuildingInfo(record.buildingName || "");
              const {
                isPaidFull,
                isPartialPaid,
                totalDue,
                totalAppliedThisMonth,
                balanceDue,
                advanceThisMonth,
              } = getPaymentStatus(record);

              return (
                <div
                  key={record.tenantId}
                  onClick={() => handleEditClick(record)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
                    getBuildingCardStyle(record.buildingName || ""),
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p
                        className={cn(
                          "font-semibold",
                          getBuildingTextColor(record.buildingName || ""),
                        )}
                      >
                        {record.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.houseNumber || "N/A"} •{" "}
                        {getIconEmoji(building?.icon)}{" "}
                        {building?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isPaidFull && (
                        <span className="px-2 py-0.5 text-xs bg-success/20 text-success rounded-full flex items-center gap-1">
                          <icons.checkCircle className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {isPartialPaid && (
                        <span className="px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full flex items-center gap-1">
                          <icons.clock className="w-3 h-3" /> Partial
                        </span>
                      )}
                      {advanceThisMonth > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                          Advance
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Due</p>
                      <p className="font-medium text-foreground">
                        {formatMoney(totalDue, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid this month</p>
                      <p className="font-medium text-success">
                        {formatMoney(totalAppliedThisMonth, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Show penalty row only if penalties exist for this tenant */}
                  {(record.penalties || 0) > 0 && (
                    <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                      Penalty: {formatMoney(record.penalties!, currency)}
                    </div>
                  )}

                  {balanceDue > 0 && (
                    <div className="mt-2 text-sm">
                      <p className="text-danger font-medium">
                        Balance: {formatMoney(balanceDue, currency)}
                      </p>
                    </div>
                  )}
                  {advanceThisMonth > 0 && (
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      +{formatMoney(advanceThisMonth, currency)} carried forward
                    </div>
                  )}

                  {record.transactions && record.transactions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <icons.fileText className="w-3 h-3" />
                        {record.transactions.length} transaction(s)
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No active tenants found matching your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentUpdateModal
        isOpen={!!editingRecord}
        onClose={() => dispatch(setEditingRecord(null))}
        tenant={editingTenant}
        record={editingRecord}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
