import React from "react";
import { Building2 } from "lucide-react";
import { useBuilding } from "@/contexts/BuildingContext";
import { cn } from "@/lib/utils";

export function BuildingSelector() {
  const { buildings, selectedBuilding, setSelectedBuilding } = useBuilding();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Select Building</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* All Buildings Option */}
        <button
          onClick={() => setSelectedBuilding(null)}
          className={cn(
            "relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left",
            "hover:shadow-md hover:scale-[1.02]",
            selectedBuilding === null
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border bg-card hover:border-primary/50"
          )}
        >
          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🏢</div>
          <div className="font-medium text-foreground text-xs sm:text-sm">
            All Buildings
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            View all
          </div>
          {selectedBuilding === null && (
            <div className="absolute top-2 right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full" />
          )}
        </button>

        {/* Individual Buildings */}
        {buildings.map((building) => (
          <button
            key={building.code}
            onClick={() => setSelectedBuilding(building.code)}
            className={cn(
              "relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left",
              "hover:shadow-md hover:scale-[1.02]",
              selectedBuilding === building.code
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
              {building.icon}
            </div>
            <div className="font-medium text-foreground text-xs sm:text-sm leading-tight">
              {building.name}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              Code: {building.code}
            </div>
            {selectedBuilding === building.code && (
              <div
                className="absolute top-2 right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                style={{ backgroundColor: building.color }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
