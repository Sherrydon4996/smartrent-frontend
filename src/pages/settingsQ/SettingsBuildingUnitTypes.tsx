import React, { useState } from "react";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import { setSelectedBuilding } from "@/slices/settingsQuerySlice";
import type { BuildingUnitConfig } from "./types";
import { getIconEmoji } from "../buildingPage/utils";
import { useSettingsApi } from "@/hooks/useSettingsApi";

export function SettingsBuildingsUnitTypes() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const { selectedBuildingId } = useAppSelector((state) => state.settingsQ);
  const {
    buildings,
    buildingsLoading,
    addUnitType,
    updateUnitType,
    removeUnitType,
  } = useSettingsApi();

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  // Unit Type Form States
  const [newGlobalUnitTypeName, setNewGlobalUnitTypeName] = useState("");
  const [newMonthlyRent, setNewMonthlyRent] = useState("");

  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editUnitTypeName, setEditUnitTypeName] = useState("");
  const [editMonthlyRent, setEditMonthlyRent] = useState("");

  const currentConfigs = selectedBuilding?.unitTypes || [];

  // Handlers
  const handleSelectBuilding = (id: string) => {
    dispatch(setSelectedBuilding(id));
  };

  const handleAddUnitType = async () => {
    if (!selectedBuildingId) {
      toast({
        title: "No building",
        description: "Select a building first",
        variant: "destructive",
      });
      return;
    }

    if (!newGlobalUnitTypeName.trim()) {
      toast({
        title: "Missing unit type name",
        description: "Enter a name for the unit type",
        variant: "destructive",
      });
      return;
    }

    const rent = parseInt(newMonthlyRent) || 0;
    if (rent < 0) {
      toast({
        title: "Invalid rent",
        description: "Rent cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUnitType({
        building_id: selectedBuildingId,
        name: newGlobalUnitTypeName.trim(),
        monthly_rent: rent,
      });
      toast({
        title: "Added",
        description: `${newGlobalUnitTypeName} - KES ${rent.toLocaleString()} added`,
        variant: "success",
      });
      setNewGlobalUnitTypeName("");
      setNewMonthlyRent("");
    } catch {} // Error handled in mutation
  };

  const startEditUnitConfig = (config: BuildingUnitConfig) => {
    setEditingConfigId(config.id);
    setEditUnitTypeName(config.unit_type_name || "");
    setEditMonthlyRent(config.monthly_rent.toString());
  };

  const handleUpdateUnitConfig = async () => {
    if (!editingConfigId) return;

    if (!editUnitTypeName.trim()) {
      toast({
        title: "Missing name",
        description: "Enter unit type name",
        variant: "destructive",
      });
      return;
    }

    const rent = parseInt(editMonthlyRent);
    if (isNaN(rent) || rent < 0) {
      toast({
        title: "Invalid",
        description: "Enter valid rent",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUnitType({
        id: editingConfigId,
        name: editUnitTypeName.trim(),
        monthly_rent: rent,
      });
      toast({
        title: "Updated",
        description: "Unit type updated",
        variant: "success",
      });
      setEditingConfigId(null);
    } catch {} // Error handled in mutation
  };

  const handleRemoveUnitConfig = async (id: string) => {
    if (!window.confirm("Remove this unit type from the building?")) return;

    try {
      await removeUnitType(id);
      toast({
        title: "Removed",
        description: "Unit type removed from building",
        variant: "success",
      });
    } catch {} // Error handled in mutation
  };

  if (buildingsLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Loading buildings...
      </div>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Buildings & Unit Types
        </CardTitle>
        <CardDescription>
          Select a building to manage its unit types and monthly rent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Building Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((building) => (
            <div
              key={building.id}
              onClick={() => handleSelectBuilding(building.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                selectedBuildingId === building.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getIconEmoji(building.icon)}</span>
                <div>
                  <p className="font-medium">{building.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {building.type || "Building"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unit Types Management */}
        {selectedBuilding && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Unit Types & Monthly Rent • {selectedBuilding.name}
            </h3>

            {/* Add New Unit Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/40 rounded-lg border">
              <div>
                <Label>Unit Type Name *</Label>
                <Input
                  value={newGlobalUnitTypeName}
                  onChange={(e) => setNewGlobalUnitTypeName(e.target.value)}
                  placeholder="e.g. Single Room, Bedsitter, 1BR"
                />
              </div>
              <div>
                <Label>Monthly Rent (KES) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={newMonthlyRent}
                  onChange={(e) => setNewMonthlyRent(e.target.value)}
                  placeholder="4500"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddUnitType} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Unit Type
                </Button>
              </div>
            </div>

            {/* Current Unit Types */}
            <div className="space-y-3">
              {currentConfigs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No unit types configured yet. Add one above to get started.
                </p>
              ) : (
                currentConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-muted/20 border rounded-lg"
                  >
                    {editingConfigId === config.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          value={editUnitTypeName}
                          onChange={(e) => setEditUnitTypeName(e.target.value)}
                          placeholder="Unit type name"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={editMonthlyRent}
                          onChange={(e) => setEditMonthlyRent(e.target.value)}
                          placeholder="Monthly rent"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateUnitConfig}>
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingConfigId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="font-medium text-base">
                            {config.unit_type_name || config.unit_type_id}
                          </span>
                          <span className="ml-4 text-muted-foreground">
                            Monthly Rent: KES{" "}
                            {config.monthly_rent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditUnitConfig(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveUnitConfig(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
