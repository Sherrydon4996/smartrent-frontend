import { configureStore } from "@reduxjs/toolkit";
import tenantReducer from "@/slices/TenantsSlice";
import tenantPaymentReducer from "@/slices/tenantPaymentSlice";
import maintenanceReducer from "@/slices/maintenanceSlice";
import dashboardReducer from "@/slices/dashboardSlice";
import authReducer from "@/slices/authSlice";
import buildingsReducer from "@/slices/buildingSlicequery";
import settingsQReducer from "@/slices/settingsQuerySlice";
import reportsQReducer from "@/slices/reportQuerySlice";

export const store = configureStore({
  reducer: {
    tenants: tenantReducer,
    tenantPayment: tenantPaymentReducer,
    maintenance: maintenanceReducer,
    dashboard: dashboardReducer,
    auth: authReducer,
    buildingsUi: buildingsReducer,
    settingsQ: settingsQReducer,
    reportsQ: reportsQReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
