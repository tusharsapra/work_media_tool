import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_TYPE_INFO } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
import type { PlanType } from "@mpa/shared";

export function PlanTypeSelector() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const client = usePlanStore((s) => s.clients.find((c) => c.id === clientId));
  const initWizard = usePlanStore((s) => s.initWizardForPlanType);

  if (!client) {
    return <div className="text-muted-foreground">Project not found.</div>;
  }

  const handleSelect = (planType: PlanType, enabled: boolean) => {
    if (!enabled) return;
    initWizard(planType, client.id, client.currency ?? "INR");
    navigate(`/clients/${client.id}/plans/new/wizard`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create media plan</h1>
        <p className="text-muted-foreground mt-1">What do you want to create?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLAN_TYPE_INFO.map((info) => {
          const enabled = info.enabledInMVP;
          return (
            <Card
              key={info.id}
              accent={enabled ? "cyan" : "none"}
              onClick={() => handleSelect(info.id, enabled)}
              className={
                enabled
                  ? "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,17,17,0.06)]"
                  : "opacity-60"
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold tracking-tight">{info.label}</h3>
                  {!enabled && (
                    <Badge variant="muted">
                      <Lock className="h-3 w-3" />
                      Coming soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                <p className="text-xs text-muted-foreground italic">{info.whenToUse}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
