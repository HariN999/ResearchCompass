import * as React from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Columns,
  Sparkles,
  Search,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { NavigationItem } from "./NavigationItem";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  className,
}: SidebarProps): JSX.Element {
  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "analyze", label: "Analyze", icon: FileText },
    { id: "compare", label: "Compare", icon: Columns },
    { id: "literature-review", label: "Literature Review", icon: Sparkles },
    { id: "search", label: "Search", icon: Search },
  ];

  const footerNavItems = [
    { id: "about", label: "About", icon: Info },
    { id: "github", label: "GitHub Repository", icon: GithubIcon },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-surface border-r border-border transition-all duration-300 ease-in-out z-30 shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="text-heading-m font-bold tracking-tight text-text-primary flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            ResearchCompass
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-medium bg-surface-hover">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-medium border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto" aria-label="Main Navigation">
        {mainNavItems.map((item) => (
          <NavigationItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      {/* Footer Nav Items */}
      <div className="p-3 border-t border-border space-y-1.5" aria-label="Footer Navigation">
        {footerNavItems.map((item) => (
          <NavigationItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>
    </aside>
  );
}
