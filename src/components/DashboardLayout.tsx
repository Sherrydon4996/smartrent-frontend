import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AIHelper } from "@/components/ai/AIHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Mobile Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-20 flex items-center px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="mr-3"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <span className="font-semibold text-foreground">SmartRent Manager</span>
      </header>

      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          // Desktop: margin for sidebar
          isCollapsed ? "lg:ml-20" : "lg:ml-64",
          // Mobile: no margin, just top padding for header
          "ml-0 pt-14 lg:pt-0",
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* AI Helper */}
      <AIHelper />
    </div>
  );
}
