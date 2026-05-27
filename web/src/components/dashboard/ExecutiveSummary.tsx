import type { MediaPlan } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculatePlanTotals } from "@/utils/forecastEngine";
import { generatePlanSummary } from "@/utils/insightEngine";
import { OBJECTIVES } from "@/data/defaults";
import {
  formatCurrency,
  formatDateRange,
  formatNumber,
  monthsBetween,
} from "@/utils/formatters";

interface MetricProps {
  label: string;
  value: string;
  hint?: string;
}

function Metric({ label, value, hint }: MetricProps) {
  return (
    <div className="bg-background rounded-[12px] p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
        {label}
      </div>
      <div className="dashboard-number">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export function ExecutiveSummary({ plan }: { plan: MediaPlan }) {
  const totals = calculatePlanTotals(plan.rows);
  const months = monthsBetween(plan.planningStart, plan.planningEnd).length;
  const objective = OBJECTIVES.find((o) => o.id === plan.objective)?.label ?? plan.objective;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
            Executive summary
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{plan.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(plan.planningStart, plan.planningEnd)} · {months}{" "}
            {months === 1 ? "month" : "months"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary">{objective}</Badge>
          <Badge variant="muted">{plan.primaryKPI}</Badge>
        </div>
      </div>

      <Card accent="cyan">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Media budget" value={formatCurrency(plan.netMediaBudget, plan.currency)} />
            <Metric
              label="Plan duration"
              value={`${months} ${months === 1 ? "month" : "months"}`}
            />
            <Metric label="Active platforms" value={String(plan.platforms.filter((p) => p.enabled).length)} />
            <Metric label="Geography groups" value={String(plan.geographies.length)} />
            <Metric label="Forecast impressions" value={formatNumber(totals.impressions)} />
            <Metric label="Forecast clicks" value={formatNumber(totals.clicks)} />
            <Metric label="Forecast leads" value={formatNumber(totals.leads)} />
            <Metric
              label={`Blended ${plan.primaryKPI?.toUpperCase().includes("CPL") ? "CPL" : "CPL"}`}
              value={formatCurrency(totals.blendedCPL, plan.currency)}
              hint={plan.primaryKPITarget ? `Target: ${formatCurrency(plan.primaryKPITarget, plan.currency)}` : undefined}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <p className="text-sm leading-relaxed text-foreground/90">{generatePlanSummary(plan)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
