// src/pages/BuildingsPage.tsx
import React, { useState } from "react";
import { BuildingsList } from "./BuildingLists";
import { BuildingDetails } from "./buildingDetails";

const BuildingsPage: React.FC = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {selectedBuildingId ? (
        <BuildingDetails
          buildingId={selectedBuildingId}
          onBack={() => setSelectedBuildingId(null)}
        />
      ) : (
        <BuildingsList onSelectBuilding={setSelectedBuildingId} />
      )}
    </div>
  );
};

export default BuildingsPage;
