import React from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CurrentDate } from "./../components/CurrentDate";

export function LoadingState({
  title = "Loading Tenants",
  text = "Please wait while we fetch your data...",
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 shadow-card">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{text}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function LoadingDataState({
  title = "Loading...",
  text = "Preparing your payment history",
}) {
  return (
    <div className="space-y-6 animate-fade-in min-h-[60vh] flex flex-col items-center justify-center">
      <CurrentDate />

      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary via-primary/70 to-primary/40 animate-pulse-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-background animate-bounce [animation-delay:0.3s]"></div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xl font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

// Alternative skeleton loading (more detailed)
export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-muted animate-pulse rounded" />
        <div className="w-full sm:w-44 h-11 bg-muted animate-pulse rounded" />
        <div className="w-full sm:w-52 h-11 bg-muted animate-pulse rounded" />
      </div>

      {/* Table Skeleton */}
      <Card className="shadow-card overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
