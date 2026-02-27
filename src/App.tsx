// src/App.tsx
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "@/store/store";
import { LandingPage } from "@/components/LandingPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AIHelper } from "@/components/ai/AIHelper";
import { TenantDetails } from "@/pages/TenantDetails";
import { MonthlyUpdates } from "./pages/monthlyUpdates/MonthlyUpdates";
import { Maintenance } from "@/pages/maintenance/Maintenance";
import { Expenses } from "@/pages/Expenses";
import NotFound from "./pages/NotFound";
import { Tenants } from "./pages/TenantPage/Tenants";
import { Settings } from "./pages/settingsQ/Settings";
import { Payments } from "./pages/Payments/Payments";
import { Dashboard } from "./pages/dashboard/mainDashboard";
import { useEffect } from "react";
import BuildingsPage from "./pages/buildingPage/BuildingPage";
import { Reports } from "./pages/reports/report";
import { useAuth } from "./hooks/useAuthentication";
import { AuthLoadingSpinner } from "./loaders/authSpinner";
import { SessionExpiryListener } from "./Apis/SessionExpiryListener";
import { useAppSelector } from "./store/hooks";

const queryClient = new QueryClient();

// ✅ This component runs ONCE when the app loads
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { bootstrapAuth } = useAuth();

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]); // Empty array = run once on mount

  const theme = useAppSelector((state) => state.settingsQ.theme);

  useEffect(() => {
    // Apply initial theme from Redux/localStorage on mount
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]); // Re-run if theme ever changes

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingSpinner message="Verifying your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingSpinner message="Loading application" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenants/:id" element={<TenantDetails />} />
        <Route path="buildings" element={<BuildingsPage />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="monthly-updates" element={<MonthlyUpdates />} />
        <Route path="settings" element={<Settings />} />
        <Route path="ai-helper" element={<AIHelper />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <SessionExpiryListener />
          <AppRoutes />
          <Toaster />
          <Sonner />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

export default App;
