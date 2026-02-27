import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { icons } from "@/utils/utils";
import { getIconEmoji } from "../buildingPage/utils";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { LoadingDataState } from "@/loaders/dataLoader";

interface TenantFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "left";
  onStatusChange: (value: "all" | "active" | "left") => void;
  buildingFilter: string;
  onBuildingChange: (value: string) => void;
}

export function TenantFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  buildingFilter,
  onBuildingChange,
}: TenantFiltersProps) {
  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();
  const settingsBuildings = buildings ?? [];

  if (buildingsLoading)
    return <LoadingDataState title="loading..." text="fetching buildings" />;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, house number, or phone..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-44 h-11">
          <icons.filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tenants</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="left">Left</SelectItem>
        </SelectContent>
      </Select>
      <Select value={buildingFilter} onValueChange={onBuildingChange}>
        <SelectTrigger className="w-full sm:w-52 h-11">
          <icons.building2 className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Building" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Buildings</SelectItem>
          {settingsBuildings.map((building) => (
            <SelectItem key={building.id} value={building.name}>
              <span className="flex items-center gap-2">
                <span>{getIconEmoji(building.icon)}</span>
                <span>{building.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
