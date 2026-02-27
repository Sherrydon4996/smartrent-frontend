// src/slices/maintenanceSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MaintenanceRequest } from "@/pages/maintenance/types";

interface MaintenanceState {
  // UI State - Selected Items
  selectedRequest: MaintenanceRequest | null;

  // UI State - Dialog Controls
  isAddRequestDialogOpen: boolean;
  isAddExpenseDialogOpen: boolean;

  // UI State - Filters
  buildingFilter: string;
}

const initialState: MaintenanceState = {
  selectedRequest: null,
  isAddRequestDialogOpen: false,
  isAddExpenseDialogOpen: false,
  buildingFilter: "all",
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    // ── Selected Item Actions ──────────────────────────────────────────────
    setSelectedRequest: (
      state,
      action: PayloadAction<MaintenanceRequest | null>,
    ) => {
      state.selectedRequest = action.payload;
    },

    // ── Dialog Controls ────────────────────────────────────────────────────
    setAddRequestDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddRequestDialogOpen = action.payload;
    },

    setAddExpenseDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddExpenseDialogOpen = action.payload;
    },

    // ── Filter Actions ─────────────────────────────────────────────────────
    setBuildingFilter: (state, action: PayloadAction<string>) => {
      state.buildingFilter = action.payload;
    },

    // ── Reset Actions ──────────────────────────────────────────────────────
    resetMaintenanceState: () => initialState,
  },
});

export const {
  setSelectedRequest,
  setAddRequestDialogOpen,
  setAddExpenseDialogOpen,
  setBuildingFilter,
  resetMaintenanceState,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
