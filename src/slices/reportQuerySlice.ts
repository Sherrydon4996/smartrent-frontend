// src/store/slices/reportSlice.ts
import { ReportState } from "@/pages/reports/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: ReportState = {
  filters: {},
};

const reportSlice = createSlice({
  name: "reportsQ",
  initialState,
  reducers: {
    setReportFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearReportFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setReportFilters, clearReportFilters } = reportSlice.actions;
export default reportSlice.reducer;
