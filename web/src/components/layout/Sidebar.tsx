import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, LayoutDashboard, FileText, ChevronLeft } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Button } from "@/components/ui/button";
import { usePlanStore } from "@/store/usePlanStore";
import { groupById } from "@/data/projectGroups";
import { cn } from "@/lib/utils";

const navItems = [{ to: "/", label: "Projects", icon: LayoutGrid, end: true }];

export function Sidebar() {
  const collapsed = usePlanStore((s) => s.ui.sidebarCollapsed);
  const toggleSidebar = usePlanStore((s) => s.toggleSidebar);
  const currentClientId = usePlanStore((s) => s.currentClientId);
  const currentPlanId = usePlanStore((s) => s.currentPlanId);
  const clients = usePlanStore((s) => s.clients);
  const location = useLocation();

  const currentClient = clients.find((c) => c.id === currentClientId);
  const currentPlan = currentClient?.plans.find((p) => p.id === currentPlanId);

  return (
    <aside
      className={cn(
        "border-r border-border bg-card flex flex-col transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <BrandMark size={24} />
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[13px] font-bold tracking-tight">ARM</div>
            <div className="text-[11px] text-muted-foreground font-medium">Media Planning OS</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-semibold transition-colors",
                isActive || location.pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-background"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && currentClient && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
              Current
            </div>
            <NavLink
              to={`/projects/${groupById(currentClient.projectGroup).slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-[12px] text-xs font-medium text-muted-foreground hover:bg-background transition-colors"
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{groupById(currentClient.projectGroup).label}</span>
            </NavLink>
            <NavLink
              to={`/clients/${currentClient.id}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-medium transition-colors",
                  isActive ? "bg-background text-foreground" : "text-foreground/80 hover:bg-background"
                )
              }
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="truncate">{currentClient.name}</span>
            </NavLink>
            {currentPlan && (
              <NavLink
                to={`/clients/${currentClient.id}/plans/${currentPlan.id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-medium transition-colors ml-4",
                    isActive ? "bg-background text-foreground" : "text-foreground/70 hover:bg-background"
                  )
                }
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{currentPlan.name}</span>
              </NavLink>
            )}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-start gap-2"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
