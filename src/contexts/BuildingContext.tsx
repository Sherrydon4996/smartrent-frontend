import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Building {
  code: string;
  name: string;
  color: string;
  icon: string;
}

const DEFAULT_BUILDINGS: Building[] = [
  { code: "001", name: "Light House", color: "hsl(45, 100%, 51%)", icon: "🏠" },
  { code: "002", name: "Blue Heart", color: "hsl(210, 100%, 50%)", icon: "💙" },
  {
    code: "003",
    name: "Green Valley",
    color: "hsl(134, 61%, 41%)",
    icon: "🌿",
  },
  {
    code: "004",
    name: "Sunset Plaza",
    color: "hsl(25, 100%, 50%)",
    icon: "🌅",
  },
];

interface BuildingContextType {
  selectedBuilding: string | null; // null means "All Buildings"
  setSelectedBuilding: (code: string | null) => void;
  buildings: Building[];
  getBuildingByCode: (code: string) => Building | undefined;
  addBuilding: (building: Building) => void;
  removeBuilding: (code: string) => void;
}

const BuildingContext = createContext<BuildingContextType | undefined>(
  undefined
);

// Export BUILDINGS as a getter that returns current buildings state
export let BUILDINGS: Building[] = DEFAULT_BUILDINGS;

export function BuildingProvider({ children }: { children: ReactNode }) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<Building[]>(DEFAULT_BUILDINGS);

  // Keep BUILDINGS in sync
  BUILDINGS = buildings;

  const getBuildingByCode = (name: string) => {
    return buildings.find((b) => b.name === name);
  };

  const addBuilding = (building: Building) => {
    setBuildings((prev) => [...prev, building]);
  };

  const removeBuilding = (code: string) => {
    setBuildings((prev) => prev.filter((b) => b.code !== code));
  };

  return (
    <BuildingContext.Provider
      value={{
        selectedBuilding,
        setSelectedBuilding,
        buildings,
        getBuildingByCode,
        addBuilding,
        removeBuilding,
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuilding() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error("useBuilding must be used within a BuildingProvider");
  }
  return context;
}
