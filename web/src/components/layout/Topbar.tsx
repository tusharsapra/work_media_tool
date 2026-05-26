import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AiModeBadge } from "./AiModeBadge";
import { Badge } from "@/components/ui/badge";
import { usePlanStore } from "@/store/usePlanStore";

const STATUS_VARIANT = {
  draft: "muted",
  internal_review: "warning",
  client_revision: "warning",
  final: "success",
  post_actuals: "primary",
  archived: "muted",
} as const;

export function Topbar() {
  const location = useLocation();
  const params = useParams();
  const clients = usePlanStore((s) => s.clients);

  const client = params.clientId ? clients.find((c) => c.id === params.clientId) : undefined;
  const plan =
    params.planId && client ? client.plans.find((p) => p.id === params.planId) : undefined;

  const segments: { label: string; to?: string }[] = [{ label: "Clients", to: "/" }];
  if (client) segments.push({ label: client.name, to: `/clients/${client.id}` });
  if (plan) segments.push({ label: plan.name });
  else if (location.pathname.endsWith("/wizard")) segments.push({ label: "New plan" });
  else if (location.pathname.endsWith("/plans/new")) segments.push({ label: "New plan" });

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <nav className="flex items-center gap-2 text-sm">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            {seg.to ? (
              <Link to={seg.to} className="text-muted-foreground hover:text-foreground font-medium">
                {seg.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{seg.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {plan && (
          <Badge variant={STATUS_VARIANT[plan.status] ?? "muted"} className="capitalize">
            {plan.status.replace(/_/g, " ")}
          </Badge>
        )}
        <AiModeBadge />
      </div>
    </header>
  );
}
