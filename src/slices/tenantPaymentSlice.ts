// src/slices/tenantPaymentSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TenantMonthlyRecord } from "@/pages/monthlyUpdates/types";

interface TenantPaymentState {
  // UI State - Selected Record
  editingRecord: TenantMonthlyRecord | null;

  // UI State - Modal Controls
  isPaymentModalOpen: boolean;

  // UI State - Filters (if needed for persistence)
  selectedMonth: string | null;
  selectedYear: number | null;
}

const initialState: TenantPaymentState = {
  editingRecord: null,
  isPaymentModalOpen: false,
  selectedMonth: null,
  selectedYear: null,
};

const tenantPaymentSlice = createSlice({
  name: "tenantPayment",
  initialState,
  reducers: {
    // ── Record Selection ───────────────────────────────────────────────────
    setEditingRecord: (
      state,
      action: PayloadAction<TenantMonthlyRecord | null>,
    ) => {
      state.editingRecord = action.payload;
      state.isPaymentModalOpen = !!action.payload; // Auto-open modal when record is set
    },

    // ── Modal Controls ─────────────────────────────────────────────────────
    setPaymentModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPaymentModalOpen = action.payload;
      if (!action.payload) {
        state.editingRecord = null; // Clear editing record when modal closes
      }
    },

    // ── Filter Persistence (Optional) ──────────────────────────────────────
    setSelectedMonth: (state, action: PayloadAction<string | null>) => {
      state.selectedMonth = action.payload;
    },

    setSelectedYear: (state, action: PayloadAction<number | null>) => {
      state.selectedYear = action.payload;
    },

    // ── Reset Actions ──────────────────────────────────────────────────────
    resetPaymentState: (state) => {
      state.editingRecord = null;
      state.isPaymentModalOpen = false;
    },
  },
});

export const {
  setEditingRecord,
  setPaymentModalOpen,
  setSelectedMonth,
  setSelectedYear,
  resetPaymentState,
} = tenantPaymentSlice.actions;

export default tenantPaymentSlice.reducer;
