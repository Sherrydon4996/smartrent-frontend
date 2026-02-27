import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Smartphone,
  Building,
  Droplets,
  Trash2,
  Banknote,
  PlusCircle, // ← new icon suggestion for deposit
} from "lucide-react";

interface PaymentStatsCardsProps {
  totalCollected: number; // now excludes deposit
  rentTotal: number;
  waterTotal: number;
  garbageTotal: number;
  depositTotal: number; // ← new prop we'll need
  mpesaTotal: number;
  bankTotal: number;
  cashTotal: number;
  formatCurrency: (amount: number) => string;
}

export function PaymentStatsCards({
  totalCollected,
  rentTotal,
  waterTotal,
  garbageTotal,
  depositTotal,
  mpesaTotal,
  bankTotal,
  cashTotal,
  formatCurrency,
}: PaymentStatsCardsProps) {
  const stats = [
    {
      icon: CreditCard,
      value: totalCollected, // ← rent + water + garbage (+ penalty if you include it)
      label: "Rent + Bills",
      bgColor:
        "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: CreditCard,
      value: rentTotal,
      label: "Rent Only",
      bgColor:
        "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Droplets,
      value: waterTotal,
      label: "Water",
      bgColor:
        "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      icon: Trash2,
      value: garbageTotal,
      label: "Garbage",
      bgColor:
        "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: PlusCircle, // or use Banknote / CreditCard — your choice
      value: depositTotal,
      label: "Deposits",
      bgColor:
        "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: Smartphone,
      value: mpesaTotal,
      label: "M-Pesa",
      bgColor:
        "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Building,
      value: bankTotal,
      label: "Bank",
      bgColor:
        "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Banknote,
      value: cashTotal,
      label: "Cash",
      bgColor:
        "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="relative">
      {/* Horizontal scroll container with snap on small screens */}
      <div
        className={`
          flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory
          scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
          sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8
          sm:overflow-x-hidden sm:snap-none
        `}
      >
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`
              flex-shrink-0 w-64 sm:w-auto
              shadow-sm border transition-all hover:shadow-md
              ${stat.bgColor}
              min-w-[240px] snap-start
              sm:min-w-0
            `}
          >
            <CardContent className="p-3.5">
              {" "}
              {/* ← reduced padding from 4 → 3.5 */}
              <div className="flex items-center justify-center gap-2.5">
                {" "}
                {/* ← smaller gap */}
                <div
                  className={`
                    w-9 h-9 rounded-lg ${stat.iconBg}
                    flex items-center justify-center flex-shrink-0
                  `}
                >
                  <stat.icon
                    size={20}
                    className={`w-4.5 h-4.5 ${stat.iconColor}`}
                  />{" "}
                  {/* ← smaller icon 5→4.5 */}
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm lg:text:lg font-bold text-foreground leading-tight">
                    {formatCurrency(stat.value)}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optional fade on edges when scrollable */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent sm:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />
    </div>
  );
}
