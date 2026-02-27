import { createSlice } from "@reduxjs/toolkit";

// buildingsUiSlice.ts
interface BuildingsUiState {
  selectedBuilding: string | null;
  buildingFormOpen: boolean;
  // filters, search, view mode, etc...
}

const initialState: BuildingsUiState = {
  selectedBuilding: null,
  buildingFormOpen: false,
};

const buildingsUiSlice = createSlice({
  name: "buildingsUi",
  initialState,
  reducers: {
    setSelectedBuilding: (state, action: PayloadAction<string | null>) => {
      state.selectedBuilding = action.payload;
    },
    toggleBuildingForm: (state) => {
      state.buildingFormOpen = !state.buildingFormOpen;
    },
  },
});
export const { setSelectedBuilding, toggleBuildingForm } =
  buildingsUiSlice.actions;
export default buildingsUiSlice.reducer;
