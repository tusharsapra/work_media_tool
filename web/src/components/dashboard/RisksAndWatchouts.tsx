import type { MediaPlan } from "@mpa/shared";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateBudgetWarnings } from "@/utils/forecastEngine";
import { monthsBetween } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export function RisksAndWatchouts({ plan }: { plan: MediaPlan }) {
  const warnings = generateBudgetWarnings(
    plan.netMediaBudget,
    plan.platforms.filter((p) => p.enabled).length,
    plan.geographies.length,
    monthsBetween(plan.planningStart, plan.planningEnd).length
  );

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
        Risks & Watchouts
      </div>
      <Card accent={warnings.length > 0 ? "magenta" : "lime"}>
        <CardContent className="pt-6">
          {warnings.length === 0 ? (
            <div className="flex items-center gap-3 py-2">
              <div className="rounded-full bg-success/10 text-success h-9 w-9 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold tracking-tight">No structural risks detected</h4>
                <p className="text-sm text-muted-foreground">
                  Budget, platform count, and geography spread look healthy. AI-narrated insights
                  land in Phase 3.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {warnings.map((w) => (
                <div key={w.code} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-full h-8 w-8 flex items-center justify-center shrink-0",
                      w.severity === "error" && "bg-danger/10 text-danger",
                      w.severity === "warning" && "bg-warning/10 text-warning",
                      w.severity === "info" && "bg-primary/10 text-primary"
                    )}
                  >
                    {w.severity === "error" && <AlertCircle className="h-4 w-4" />}
                    {w.severity === "warning" && <AlertTriangle className="h-4 w-4" />}
                    {w.severity === "info" && <Info className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <Badge
                      variant={
                        w.severity === "error"
                          ? "danger"
                          : w.severity === "warning"
                            ? "warning"
                            : "primary"
                      }
                      className="capitalize mb-1"
                    >
                      {w.severity}
                    </Badge>
                    <p className="text-sm">{w.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
