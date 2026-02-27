// src/slices/dashboardSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  // UI State - Filters
  selectedBuildingId: string;
  selectedMonth: string;
  selectedYear: number;

  // UI State - View Options
  showCharts: boolean;
  expandedSections: string[];
}

const initialState: DashboardState = {
  // Filters
  selectedBuildingId: "",
  selectedMonth: "",
  selectedYear: new Date().getFullYear(),

  // View Options
  showCharts: true,
  expandedSections: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // ── Filter Actions ─────────────────────────────────────────────────────
    setSelectedBuildingId: (state, action: PayloadAction<string>) => {
      state.selectedBuildingId = action.payload;
    },

    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },

    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },

    // ── View Options ───────────────────────────────────────────────────────
    setShowCharts: (state, action: PayloadAction<boolean>) => {
      state.showCharts = action.payload;
    },

    toggleSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      const index = state.expandedSections.indexOf(sectionId);

      if (index >= 0) {
        state.expandedSections.splice(index, 1);
      } else {
        state.expandedSections.push(sectionId);
      }
    },

    // ── Reset Actions ──────────────────────────────────────────────────────
    resetDashboardFilters: (state) => {
      state.selectedBuildingId = "";
      state.selectedMonth = "";
      state.selectedYear = new Date().getFullYear();
    },

    resetDashboardState: () => initialState,
  },
});

export const {
  setSelectedBuildingId,
  setSelectedMonth,
  setSelectedYear,
  setShowCharts,
  toggleSection,
  resetDashboardFilters,
  resetDashboardState,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
