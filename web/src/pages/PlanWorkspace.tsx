import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MediaPlanTable } from "@/components/plan/MediaPlanTable";
import { AssumptionsEditor } from "@/components/plan/AssumptionsEditor";
import { ExportPanel } from "@/components/plan/ExportPanel";
import { StakeholderDashboard } from "@/components/dashboard/StakeholderDashboard";
import { usePlanStore } from "@/store/usePlanStore";
import { OBJECTIVES } from "@/data/defaults";
import { formatDateRange } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";

export function PlanWorkspace() {
  const { clientId, planId } = useParams<{ clientId: string; planId: string }>();
  const navigate = useNavigate();
  const client = usePlanStore((s) => s.clients.find((c) => c.id === clientId));
  const plan = client?.plans.find((p) => p.id === planId);
  const setCurrentClient = usePlanStore((s) => s.setCurrentClient);
  const setCurrentPlan = usePlanStore((s) => s.setCurrentPlan);

  useEffect(() => {
    if (clientId) setCurrentClient(clientId);
    if (planId) setCurrentPlan(planId);
  }, [clientId, planId, setCurrentClient, setCurrentPlan]);

  if (!client || !plan || !clientId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Plan not found.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <Badge variant="muted" className="capitalize">
            {plan.type.replace(/_/g, " ")}
          </Badge>
          <span>{formatDateRange(plan.planningStart, plan.planningEnd)}</span>
          <span>·</span>
          <span>{OBJECTIVES.find((o) => o.id === plan.objective)?.label}</span>
          <span>·</span>
          <span>{plan.primaryKPI}</span>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plan">Media plan</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <StakeholderDashboard plan={plan} clientId={clientId} />
        </TabsContent>

        <TabsContent value="plan">
          <MediaPlanTable plan={plan} />
        </TabsContent>

        <TabsContent value="assumptions">
          <AssumptionsEditor plan={plan} clientId={clientId} />
        </TabsContent>

        <TabsContent value="export">
          <ExportPanel plan={plan} client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
