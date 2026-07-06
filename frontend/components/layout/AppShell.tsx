import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageContainer } from "./PageContainer";

export interface AppShellProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  breadcrumbs?: string[];
  children?: React.ReactNode;
}

export function AppShell({
  activeTab,
  onTabChange,
  title,
  breadcrumbs,
  children,
}: AppShellProps): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState<boolean>(false);

  // Automatically collapse on smaller desktop screen sizes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabSelect = (tab: string) => {
    onTabChange(tab);
    setIsMobileOpen(false); // Close mobile drawer on selection
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden relative font-sans text-text-primary">
      {/* 1. Desktop Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden md:flex"
      />

      {/* 2. Mobile / Tablet Overlay Drawer Navigation */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity">
          <div className="fixed inset-y-0 left-0 w-[260px] bg-surface border-r border-border z-50 flex flex-col shadow-dialog">
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <span className="text-heading-m font-bold text-text-primary">
                ResearchCompass
              </span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-medium border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Direct Sidebar Layout rendering locally inside the mobile drawer */}
            <Sidebar
              activeTab={activeTab}
              onTabChange={handleTabSelect}
              collapsed={false}
              onToggleCollapse={() => {}}
              className="flex-1 border-r-0"
            />
          </div>
        </div>
      )}

      {/* 3. Main content workflow column */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        <Header
          title={title}
          breadcrumbs={breadcrumbs}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />
        
        {/* Main scrollable body wrapper */}
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
