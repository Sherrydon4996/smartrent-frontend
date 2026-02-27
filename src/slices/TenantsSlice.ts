// src/slices/tenantsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MONTHS } from "@/utils/utils";
import dayjs from "dayjs";
import type { Tenant, StatusFilter } from "@/pages/TenantPage/types";

interface TenantsState {
  // UI State - Filters
  buildingFilter: string;
  statusFilter: StatusFilter;
  searchTerm: string;
  selectedMonth: string;
  selectedYear: number;

  // UI State - Dialog Controls
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // UI State - Selected Items
  editingTenant: Tenant | null;
  tenantToDelete: Tenant | null;
  receiptTenant: Tenant | null;
  paymentHistoryTenant: Tenant | null;
}

const initialState: TenantsState = {
  // Filters
  buildingFilter: "all",
  statusFilter: "all",
  searchTerm: "",
  selectedMonth: MONTHS[dayjs().month()],
  selectedYear: dayjs().year(),

  // Dialogs
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,

  // Selected Items
  editingTenant: null,
  tenantToDelete: null,
  receiptTenant: null,
  paymentHistoryTenant: null,
};

const tenantsSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    // ── Filter Actions ─────────────────────────────────────────────────────
    setBuildingFilter: (state, action: PayloadAction<string>) => {
      state.buildingFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
      state.statusFilter = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },

    // ── Dialog Actions ─────────────────────────────────────────────────────
    setAddDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddDialogOpen = action.payload;
    },
    setEditDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditDialogOpen = action.payload;
    },
    setDeleteDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteDialogOpen = action.payload;
    },

    // ── Selected Item Actions ──────────────────────────────────────────────
    setEditingTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.editingTenant = action.payload;
    },
    setTenantToDelete: (state, action: PayloadAction<Tenant | null>) => {
      state.tenantToDelete = action.payload;
    },
    setReceiptTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.receiptTenant = action.payload;
    },
    setPaymentHistoryTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.paymentHistoryTenant = action.payload;
    },

    // ── Bulk Actions ───────────────────────────────────────────────────────
    resetFilters: (state) => {
      state.buildingFilter = "all";
      state.statusFilter = "all";
      state.searchTerm = "";
    },
    resetDialogs: (state) => {
      state.isAddDialogOpen = false;
      state.isEditDialogOpen = false;
      state.isDeleteDialogOpen = false;
      state.editingTenant = null;
      state.tenantToDelete = null;
      state.receiptTenant = null;
      state.paymentHistoryTenant = null;
    },
  },
});

export const {
  // Filters
  setBuildingFilter,
  setStatusFilter,
  setSearchTerm,
  setSelectedMonth,
  setSelectedYear,

  // Dialogs
  setAddDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,

  // Selected Items
  setEditingTenant,
  setTenantToDelete,
  setReceiptTenant,
  setPaymentHistoryTenant,

  // Bulk Actions
  resetFilters,
  resetDialogs,
} = tenantsSlice.actions;

export default tenantsSlice.reducer;
