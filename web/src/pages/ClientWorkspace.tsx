import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, FileText, ArrowRight, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlanStore } from "@/store/usePlanStore";
import { formatDateRange, formatCurrency } from "@/utils/formatters";
import { OBJECTIVES } from "@/data/defaults";

export function ClientWorkspace() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const client = usePlanStore((s) => s.clients.find((c) => c.id === clientId));
  const setCurrentClient = usePlanStore((s) => s.setCurrentClient);

  useEffect(() => {
    if (clientId) setCurrentClient(clientId);
  }, [clientId, setCurrentClient]);

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Client not found.</p>
        <Button onClick={() => navigate("/")}>Back to clients</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          {client.industry && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {client.industry}
            </span>
          )}
          {client.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              {client.website.replace(/^https?:\/\//, "")}
            </span>
          )}
          <Badge variant="default">{client.currency}</Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold tracking-tight">Plans</h2>
        <Button asChild>
          <Link to={`/clients/${client.id}/plans/new`}>
            <Plus className="h-4 w-4" />
            New plan
          </Link>
        </Button>
      </div>

      {client.plans.length === 0 ? (
        <Card accent="cyan" className="p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold tracking-tight mb-1">
            Turn planning inputs into client-ready forecasts
          </h3>
          <p className="text-muted-foreground mb-5">
            Create your first media plan to generate forecasts and a stakeholder dashboard.
          </p>
          <Button asChild>
            <Link to={`/clients/${client.id}/plans/new`}>Create media plan</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {client.plans.map((plan) => (
            <Link key={plan.id} to={`/clients/${client.id}/plans/${plan.id}`}>
              <Card className="hover:-translate-y-0.5 transition-all hover:shadow-[0_8px_24px_rgba(17,17,17,0.06)]">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold tracking-tight">{plan.name}</h3>
                      <Badge variant="muted" className="capitalize">
                        {plan.type.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="primary" className="capitalize">
                        {plan.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3">
                      <span>{formatDateRange(plan.planningStart, plan.planningEnd)}</span>
                      <span>•</span>
                      <span>{formatCurrency(plan.totalBudget, plan.currency)}</span>
                      <span>•</span>
                      <span>
                        {OBJECTIVES.find((o) => o.id === plan.objective)?.label} ({plan.primaryKPI})
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
