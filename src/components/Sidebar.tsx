import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Wrench,
  DollarSign,
  Settings,
  Building2,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleTheme } from "@/slices/settingsQuerySlice";
import { icons } from "@/utils/utils";
import { useAuth } from "@/hooks/useAuthentication";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/buildings", icon: Building2, label: "Buildings" },
  { path: "/tenants", icon: Users, label: "Tenants" },
  { path: "/monthly-updates", icon: CalendarCheck, label: "Monthly Updates" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/maintenance", icon: Wrench, label: "Maintenance" },
  { path: "/expenses", icon: DollarSign, label: "Expenses" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.settingsQ);

  const location = useLocation();

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleLogout = async () => {
    await logout(); // This will show "Logged out successfully" toast
    navigate("/", { replace: true });
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && !isMobileOpen && "justify-center w-full",
          )}
        >
          <icons.building2 className="w-8 h-8 text-primary flex-shrink-0" />
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-lg font-bold text-sidebar-foreground">
              SmartRent
            </span>
          )}
        </div>
        {/* Mobile close button */}
        {isMobileOpen && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* Desktop collapse button */}
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground hidden lg:block",
            isCollapsed &&
              "absolute -right-3 top-6 bg-sidebar border border-sidebar-border shadow-sm",
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && !isMobileOpen && "justify-center",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-primary-foreground",
                )}
              />
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            isCollapsed && !isMobileOpen && "justify-center",
          )}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-sm">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* User Info */}
        {(!isCollapsed || isMobileOpen) && user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.username}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-danger hover:text-danger hover:bg-danger/10",
            isCollapsed && !isMobileOpen && "justify-center px-0",
          )}
        >
          <LogOut className="w-5 h-5" />
          {(!isCollapsed || isMobileOpen) && (
            <span className="ml-3">Logout</span>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:hidden w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-30 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden lg:flex",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
