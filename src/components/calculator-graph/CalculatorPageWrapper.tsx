"use client";

import { useEffect, useState } from "react";
import { NavigationStore } from "@/store/Navigation";

export default function CalculatorPageWrapper({ children }: { children: React.ReactNode }) {
  const { sideNavCollapsed } = NavigationStore();
  const [sidebarWidth, setSidebarWidth] = useState("5.5rem"); // Default collapsed width

  useEffect(() => {
    // Update sidebar width based on state
    // --siderail-collapsed-width = 5.5rem, expanded = 15rem
    if (sideNavCollapsed) {
      setSidebarWidth("5.5rem");
    } else {
      setSidebarWidth("15rem");
    }
  }, [sideNavCollapsed]);

  return (
    <div 
      className="calculator-page-wrapper"
      style={{ 
        marginLeft: sidebarWidth,
        width: `calc(100% - ${sidebarWidth})`
      }}
    >
      {children}
    </div>
  );
}
