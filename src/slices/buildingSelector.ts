// Reusable selectors - helps keep components cleaner
import { createSelector } from "@reduxjs/toolkit";

export const selectBuildings = (state) => state.buildings.list;
export const selectSelectedBuilding = (state) =>
  state.buildings.selectedBuilding;
export const selectBuildingsLoading = (state) => state.buildings.loading;
export const selectBuildingsError = (state) => state.buildings.error;

export const selectBuildingById = createSelector(
  [selectBuildings, (_, buildingId) => buildingId],
  (buildings, buildingId) => buildings.find((b) => b.id === buildingId)
);

export const selectUnitsForSelectedBuilding = createSelector(
  [selectSelectedBuilding],
  (building) => building?.units || []
);

export const selectStaffForSelectedBuilding = createSelector(
  [selectSelectedBuilding],
  (building) => building?.staff || []
);
